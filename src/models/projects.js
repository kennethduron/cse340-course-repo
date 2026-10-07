import db from './db.js';

const getAllProjects = async () => {
    const query = `
        SELECT p.project_id,
               p.organization_id,
               p.title,
               p.description,
               p.location,
               p.date,
               o.name AS organization_name
        FROM public.project p
        JOIN public.organization o
            ON p.organization_id = o.organization_id
        ORDER BY p.date, p.project_id;
    `;

    const result = await db.query(query);

    return result.rows;
};

const getProjectsByOrganizationId = async (organizationId) => {
    const query = `
        SELECT project_id,
               title,
               description,
               location,
               date,
               organization_id
        FROM public.project
        WHERE organization_id = $1
        ORDER BY date;
    `;

    const result = await db.query(query, [organizationId]);
    return result.rows;
};

const getUpcomingProjects = async (numberOfProjects) => {
    const query = `
        SELECT p.project_id,
               p.title,
               p.description,
               p.date,
               p.location,
               p.organization_id,
               o.name AS organization_name
        FROM public.project p
        JOIN public.organization o
            ON p.organization_id = o.organization_id
        WHERE p.date >= CURRENT_DATE
        ORDER BY p.date ASC
        LIMIT $1;
    `;

    const result = await db.query(query, [numberOfProjects]);
    return result.rows;
};

const getProjectDetails = async (projectId) => {
    const query = `
        SELECT p.project_id,
               p.title,
               p.description,
               p.date,
               p.location,
               p.organization_id,
               o.name AS organization_name
        FROM public.project p
        JOIN public.organization o
            ON p.organization_id = o.organization_id
        WHERE p.project_id = $1;
    `;

    const result = await db.query(query, [projectId]);
    return result.rows[0] || null;
};

const createProject = async (title, description, location, date, organizationId) => {
    const query = `INSERT INTO project (title, description, location, date, organization_id)
        VALUES ($1, $2, $3, $4, $5) RETURNING project_id;`;
    const result = await db.query(query, [title, description, location, date, organizationId]);
    return result.rows[0].project_id;
};

const addVolunteer = async (userId, projectId) => {
    const query = `
        INSERT INTO volunteer (user_id, project_id)
        VALUES ($1, $2)
        ON CONFLICT (user_id, project_id) DO NOTHING;
    `;

    await db.query(query, [userId, projectId]);
};

const removeVolunteer = async (userId, projectId) => {
    const query = `
        DELETE FROM volunteer
        WHERE user_id = $1
          AND project_id = $2;
    `;

    const result = await db.query(query, [userId, projectId]);
    return result.rowCount;
};

const getVolunteeredProjects = async (userId) => {
    const query = `
        SELECT p.project_id,
               p.title,
               p.description,
               p.location,
               p.date,
               p.organization_id,
               o.name AS organization_name
        FROM public.volunteer v
        JOIN public.project p
            ON p.project_id = v.project_id
        JOIN public.organization o
            ON o.organization_id = p.organization_id
        WHERE v.user_id = $1
        ORDER BY p.date, p.project_id;
    `;

    const result = await db.query(query, [userId]);
    return result.rows;
};

const isUserVolunteering = async (userId, projectId) => {
    const query = `
        SELECT EXISTS (
            SELECT 1
            FROM public.volunteer
            WHERE user_id = $1
              AND project_id = $2
        ) AS is_volunteering;
    `;

    const result = await db.query(query, [userId, projectId]);
    return Boolean(result.rows[0]?.is_volunteering);
};

const updateProject = async (projectId, title, description, location, date, organizationId) => {
    const query = `UPDATE project
        SET title = $1,
            description = $2,
            location = $3,
            date = $4,
            organization_id = $5
        WHERE project_id = $6
        RETURNING project_id;`;
    const result = await db.query(query, [title, description, location, date, organizationId, projectId]);
    if (result.rowCount === 0) {
        const error = new Error('Project not found');
        error.status = 404;
        throw error;
    }
    return result.rows[0].project_id;
};

export {
    getAllProjects,
    getProjectsByOrganizationId,
    getUpcomingProjects,
    getProjectDetails,
    createProject,
    addVolunteer,
    removeVolunteer,
    getVolunteeredProjects,
    isUserVolunteering,
    updateProject
};
