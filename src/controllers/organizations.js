import { body, validationResult } from 'express-validator';
import { createOrganization, getAllOrganizations, getOrganizationDetails, updateOrganization } from '../models/organizations.js';
import { getProjectsByOrganizationId } from '../models/projects.js';

const organizationValidation = [
    body('name').trim().notEmpty().withMessage('Organization name is required.').isLength({ min: 3, max: 150 }).withMessage('Organization name must be 3 to 150 characters.'),
    body('description').trim().notEmpty().withMessage('Description is required.').isLength({ max: 500 }).withMessage('Description must be 500 characters or fewer.'),
    body('contactEmail').trim().normalizeEmail().isEmail().withMessage('A valid contact email is required.')
];

const showOrganizationsPage = async (req, res, next) => {
    try {
        const organizations = await getAllOrganizations();
        const title = 'Our Partner Organizations';
        res.render('organizations', { title, organizations });
    } catch (error) {
        next(error);
    }
};

const showOrganizationDetailsPage = async (req, res, next) => {
    try {
        const organizationId = Number(req.params.id);
        const organization = await getOrganizationDetails(organizationId);

        if (!organization) {
            const err = new Error('Organization not found');
            err.status = 404;
            return next(err);
        }

        const projects = await getProjectsByOrganizationId(organizationId);
        res.render('organization', {
            title: organization.name,
            organizationDetails: organization,
            projects
        });
    } catch (error) {
        next(error);
    }
};

const showNewOrganizationForm = (req, res) => {
    res.render('new-organization', { title: 'Add New Organization' });
};

const processNewOrganizationForm = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        errors.array().forEach((error) => req.flash('error', error.msg));
        return res.redirect('/new-organization');
    }
    try {
        const { name, description, contactEmail } = req.body;
        const organizationId = await createOrganization(name, description, contactEmail, 'placeholder-logo.png');
        req.flash('success', 'Organization added successfully!');
        res.redirect(`/organization/${organizationId}`);
    } catch (error) {
        next(error);
    }
};

const showEditOrganizationForm = async (req, res, next) => {
    try {
        const organization = await getOrganizationDetails(Number(req.params.id));
        if (!organization) {
            const error = new Error('Organization not found');
            error.status = 404;
            return next(error);
        }
        res.render('edit-organization', { title: `Edit ${organization.name}`, organization });
    } catch (error) {
        next(error);
    }
};

const processEditOrganizationForm = async (req, res, next) => {
    const errors = validationResult(req);
    const organizationId = Number(req.params.id);
    if (!errors.isEmpty()) {
        errors.array().forEach((error) => req.flash('error', error.msg));
        return res.redirect(`/edit-organization/${organizationId}`);
    }
    try {
        const { name, description, contactEmail, logoFilename } = req.body;
        await updateOrganization(organizationId, name, description, contactEmail, logoFilename);
        req.flash('success', 'Organization updated successfully!');
        res.redirect(`/organization/${organizationId}`);
    } catch (error) {
        next(error);
    }
};

export { organizationValidation, showOrganizationsPage, showOrganizationDetailsPage, showNewOrganizationForm, processNewOrganizationForm, showEditOrganizationForm, processEditOrganizationForm };
