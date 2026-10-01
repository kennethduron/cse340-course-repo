import express from 'express';
import { showHomePage, testErrorPage } from './controllers/index.js';
import { organizationValidation, processEditOrganizationForm, processNewOrganizationForm, showEditOrganizationForm, showNewOrganizationForm, showOrganizationsPage, showOrganizationDetailsPage } from './controllers/organizations.js';
import { processEditProjectForm, processNewProjectForm, projectValidation, showEditProjectForm, showNewProjectForm, showProjectsPage, showProjectDetailsPage } from './controllers/projects.js';
import { categoryValidation, processAssignCategoriesForm, processEditCategoryForm, processNewCategoryForm, showAssignCategoriesForm, showCategoriesPage, showCategoryDetailsPage, showEditCategoryForm, showNewCategoryForm } from './controllers/categories.js';
import { processUserRegistrationForm, showUserRegistrationForm, showLoginForm, processLoginForm, processLogout, requireLogin, showDashboard } from './controllers/users.js';

const router = express.Router();

router.get('/', showHomePage);
router.get('/register', showUserRegistrationForm);
router.post('/register', processUserRegistrationForm);
router.get('/login', showLoginForm);
router.post('/login', processLoginForm);
router.get('/logout', processLogout);
router.get('/dashboard', requireLogin, showDashboard);
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
router.get('/edit-project/:id', showEditProjectForm);
router.post('/edit-project/:id', projectValidation, processEditProjectForm);
router.get('/assign-categories/:projectId', showAssignCategoriesForm);
router.post('/assign-categories/:projectId', processAssignCategoriesForm);
router.get('/categories', showCategoriesPage);
router.get('/new-category', showNewCategoryForm);
router.post('/new-category', categoryValidation, processNewCategoryForm);
router.get('/category/:id', showCategoryDetailsPage);
router.get('/edit-category/:id', showEditCategoryForm);
router.post('/edit-category/:id', categoryValidation, processEditCategoryForm);
router.get('/test-error', testErrorPage);

export default router;
