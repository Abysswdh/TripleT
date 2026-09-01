"""
Doable! Backend — Projects API Endpoints
"""
from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy import func, select

from app.api.deps import CurrentUserId, DbSession
from app.models.project import Project, ProjectStatus
from app.schemas.project import (
    ProjectCreate,
    ProjectListResponse,
    ProjectResponse,
    ProjectUpdate,
)

router = APIRouter(prefix="/projects", tags=["Projects"])


@router.post("/", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    project_data: ProjectCreate,
    user_id: CurrentUserId,
    db: DbSession,
):
    """Create a new project (available to any authenticated user)."""
    project = Project(
        **project_data.model_dump(),
        owner_id=user_id,
        status=ProjectStatus.DRAFT,
    )
    db.add(project)
    await db.flush()
    await db.refresh(project)
    return project


@router.get("/", response_model=ProjectListResponse)
async def list_projects(
    db: DbSession,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    status: str | None = None,
    category: str | None = None,
):
    """List all open projects with pagination and filters."""
    query = select(Project)

    # Default to showing only open projects
    if status:
        query = query.where(Project.status == status)
    else:
        query = query.where(Project.status == ProjectStatus.OPEN)

    if category:
        query = query.where(Project.category == category)

    # Count total
    count_query = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_query)).scalar() or 0

    # Paginate
    query = query.offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(query)
    items = result.scalars().all()

    return ProjectListResponse(
        items=items,
        total=total,
        page=page,
        per_page=per_page,
    )


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: str,
    db: DbSession,
):
    """Get a single project by ID."""
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@router.patch("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: str,
    updates: ProjectUpdate,
    user_id: CurrentUserId,
    db: DbSession,
):
    """Update a project (owner only)."""
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if project.owner_id != user_id:
        raise HTTPException(status_code=403, detail="Not the project owner")

    update_data = updates.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(project, field, value)

    await db.flush()
    await db.refresh(project)
    return project


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: str,
    user_id: CurrentUserId,
    db: DbSession,
):
    """Delete a project (owner only)."""
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if project.owner_id != user_id:
        raise HTTPException(status_code=403, detail="Not the project owner")

    await db.delete(project)
