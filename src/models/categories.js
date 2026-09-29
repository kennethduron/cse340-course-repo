import db from './db.js';

const getAllCategories = async () => {
    const query = `
        SELECT category_id,
               name
        FROM public.category
        ORDER BY name;
    `;

    const result = await db.query(query);

    return result.rows;
};

const getCategoryDetails = async (categoryId) => {
    const query = `
        SELECT category_id,
               name
        FROM public.category
        WHERE category_id = $1;
    `;

    const result = await db.query(query, [categoryId]);
    return result.rows[0] || null;
};

const getCategoriesByProjectId = async (projectId) => {
    const query = `
        SELECT c.category_id,
               c.name
        FROM public.category c
        JOIN public.project_category pc
            ON c.category_id = pc.category_id
        WHERE pc.project_id = $1
        ORDER BY c.name;
    `;

    const result = await db.query(query, [projectId]);
    return result.rows;
};

const getProjectsByCategoryId = async (categoryId) => {
    const query = `
        SELECT p.project_id,
               p.title,
               p.description,
               p.location,
               p.date,
               p.organization_id
        FROM public.project p
        JOIN public.project_category pc
            ON p.project_id = pc.project_id
        WHERE pc.category_id = $1
        ORDER BY p.date;
    `;

    const result = await db.query(query, [categoryId]);
    return result.rows;
};

const assignCategoryToProject = async (categoryId, projectId) => {
    await db.query(
        'INSERT INTO project_category (category_id, project_id) VALUES ($1, $2);',
        [categoryId, projectId]
    );
};

const updateCategoryAssignments = async (projectId, categoryIds) => {
    await db.query('DELETE FROM project_category WHERE project_id = $1;', [projectId]);
    for (const categoryId of categoryIds) {
        await assignCategoryToProject(categoryId, projectId);
    }
};

const createCategory = async (name) => {
    const result = await db.query(
        'INSERT INTO category (name) VALUES ($1) RETURNING category_id;',
        [name]
    );
    return result.rows[0].category_id;
};

const updateCategory = async (categoryId, name) => {
    const result = await db.query(
        'UPDATE category SET name = $1 WHERE category_id = $2 RETURNING category_id;',
        [name, categoryId]
    );
    if (result.rowCount === 0) {
        const error = new Error('Category not found');
        error.status = 404;
        throw error;
    }
    return result.rows[0].category_id;
};

export {
    getAllCategories,
    getCategoryDetails,
    getCategoriesByProjectId,
    getProjectsByCategoryId,
    updateCategoryAssignments,
    createCategory,
    updateCategory
};
