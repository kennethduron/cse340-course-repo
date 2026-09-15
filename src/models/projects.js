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

export {
    getAllProjects,
    getProjectsByOrganizationId,
    getUpcomingProjects,
    getProjectDetails
};