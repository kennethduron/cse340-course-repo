import { getCategoriesByProjectId } from '../models/categories.js';
import {
    getProjectDetails,
    getUpcomingProjects
} from '../models/projects.js';

const NUMBER_OF_UPCOMING_PROJECTS = 5;

const showProjectsPage = async (req, res, next) => {
    try {
        const projects = await getUpcomingProjects(NUMBER_OF_UPCOMING_PROJECTS);
        const title = 'Upcoming Service Projects';
        res.render('projects', { title, projects });
    } catch (error) {
        next(error);
    }
};

const showProjectDetailsPage = async (req, res, next) => {
    try {
        const projectId = Number(req.params.id);
        const project = await getProjectDetails(projectId);

        if (!project) {
            const err = new Error('Project not found');
            err.status = 404;
            return next(err);
        }

        const categories = await getCategoriesByProjectId(projectId);
        res.render('project', {
            title: project.title,
            project,
            categories
        });
    } catch (error) {
        next(error);
    }
};

export { NUMBER_OF_UPCOMING_PROJECTS, showProjectsPage, showProjectDetailsPage };
