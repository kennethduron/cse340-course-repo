import express from 'express';
import { showHomePage, testErrorPage } from './controllers/index.js';
import { organizationValidation, processEditOrganizationForm, processNewOrganizationForm, showEditOrganizationForm, showNewOrganizationForm, showOrganizationsPage, showOrganizationDetailsPage } from './controllers/organizations.js';
import { processNewProjectForm, projectValidation, showNewProjectForm, showProjectsPage, showProjectDetailsPage } from './controllers/projects.js';
import { processAssignCategoriesForm, showAssignCategoriesForm, showCategoriesPage, showCategoryDetailsPage } from './controllers/categories.js';

const router = express.Router();

router.get('/', showHomePage);
router.get('/organizations', showOrganizationsPage);
router.get('/new-organization', showNewOrganizationForm);
router.post('/new-organization', organizationValidation, processNewOrganizationForm);
router.get('/organization/:id', showOrganizationDetailsPage);
router.get('/edit-organization/:id', showEditOrganizationForm);
router.post('/edit-organization/:id', organizationValidation, processEditOrganizationForm);
router.get('/projects', showProjectsPage);
router.get('/new-project', showNewProjectForm);
router.post('/new-project', projectValidation, processNewProjectForm);
router.get('/project/:id', showProjectDetailsPage);
router.get('/assign-categories/:projectId', showAssignCategoriesForm);
router.post('/assign-categories/:projectId', processAssignCategoriesForm);
router.get('/categories', showCategoriesPage);
router.get('/category/:id', showCategoryDetailsPage);
router.get('/test-error', testErrorPage);

export default router;
