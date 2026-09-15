-- ========================================
-- Organization Table
-- ========================================

CREATE TABLE organization (
    organization_id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    logo_filename VARCHAR(255) NOT NULL
);

-- ========================================
-- Initial Organization Data
-- ========================================

INSERT INTO organization (
    name,
    description,
    contact_email,
    logo_filename
)
VALUES
(
    'BrightFuture Builders',
    'A nonprofit focused on improving community infrastructure through sustainable construction projects.',
    'info@brightfuturebuilders.org',
    'brightfuture-logo.png'
),
(
    'GreenHarvest Growers',
    'An urban farming collective promoting food sustainability and education in local neighborhoods.',
    'contact@greenharvest.org',
    'greenharvest-logo.png'
),
(
    'UnityServe Volunteers',
    'A volunteer coordination group supporting local charities and service initiatives.',
    'hello@unityserve.org',
    'unityserve-logo.png'
);

-- ========================================
-- Service Project Table
-- ========================================

CREATE TABLE project (
    project_id SERIAL PRIMARY KEY,
    organization_id INTEGER NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    CONSTRAINT fk_project_organization
        FOREIGN KEY (organization_id)
        REFERENCES organization(organization_id)
);

-- ========================================
-- Category Table
-- ========================================

CREATE TABLE category (
    category_id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL UNIQUE
);

-- ========================================
-- Project Category Junction Table
-- ========================================

CREATE TABLE project_category (
    project_id INTEGER NOT NULL,
    category_id INTEGER NOT NULL,
    PRIMARY KEY (project_id, category_id),
    CONSTRAINT fk_project_category_project
        FOREIGN KEY (project_id)
        REFERENCES project(project_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_project_category_category
        FOREIGN KEY (category_id)
        REFERENCES category(category_id)
        ON DELETE CASCADE
);

-- ========================================
-- Category Data
-- ========================================

INSERT INTO category (name)
VALUES
    ('Community Development'),
    ('Environment'),
    ('Education'),
    ('Health and Wellness'),
    ('Volunteer Service');

-- ========================================
-- Service Project Data
-- ========================================

INSERT INTO project (
    organization_id,
    title,
    description,
    location,
    date
)
VALUES
(
    (SELECT organization_id FROM organization WHERE name = 'BrightFuture Builders'),
    'Neighborhood Home Repair Day',
    'Repairing porches, steps, and weather damage for older neighbors.',
    'Maple Ridge Neighborhood',
    CURRENT_DATE + INTERVAL '1 day'
),
(
    (SELECT organization_id FROM organization WHERE name = 'BrightFuture Builders'),
    'Accessible Ramp Construction',
    'Building safe wheelchair ramps for a community resource center.',
    'Eastside Resource Center',
    CURRENT_DATE + INTERVAL '8 days'
),
(
    (SELECT organization_id FROM organization WHERE name = 'BrightFuture Builders'),
    'Community Hall Renovation',
    'Painting and restoring a shared meeting hall for neighborhood programs.',
    'Cedar Grove Community Hall',
    CURRENT_DATE + INTERVAL '15 days'
),
(
    (SELECT organization_id FROM organization WHERE name = 'BrightFuture Builders'),
    'Safe Play Space Build',
    'Constructing a durable play area with accessible features for children.',
    'Riverside Elementary School',
    CURRENT_DATE + INTERVAL '22 days'
),
(
    (SELECT organization_id FROM organization WHERE name = 'BrightFuture Builders'),
    'Shelter Courtyard Improvements',
    'Improving outdoor gathering space and storage at a family shelter.',
    'Harbor House Shelter',
    CURRENT_DATE + INTERVAL '29 days'
),
(
    (SELECT organization_id FROM organization WHERE name = 'GreenHarvest Growers'),
    'Spring Community Garden Launch',
    'Preparing raised beds and planting vegetables for neighborhood families.',
    'Westbrook Community Garden',
    CURRENT_DATE + INTERVAL '36 days'
),
(
    (SELECT organization_id FROM organization WHERE name = 'GreenHarvest Growers'),
    'Urban Orchard Planting',
    'Planting fruit trees and teaching residents how to care for young orchards.',
    'Lincoln Avenue Greenway',
    CURRENT_DATE + INTERVAL '43 days'
),
(
    (SELECT organization_id FROM organization WHERE name = 'GreenHarvest Growers'),
    'Neighborhood Compost Workshop',
    'Launching a shared compost program and explaining soil health basics.',
    'North Market Pavilion',
    CURRENT_DATE + INTERVAL '50 days'
),
(
    (SELECT organization_id FROM organization WHERE name = 'GreenHarvest Growers'),
    'Food Sustainability Fair',
    'Connecting families with local growers, cooking lessons, and food resources.',
    'Downtown Learning Plaza',
    CURRENT_DATE + INTERVAL '57 days'
),
(
    (SELECT organization_id FROM organization WHERE name = 'GreenHarvest Growers'),
    'Summer Pollinator Garden',
    'Creating a pollinator habitat with native flowers beside a public library.',
    'Oakview Public Library',
    CURRENT_DATE + INTERVAL '64 days'
),
(
    (SELECT organization_id FROM organization WHERE name = 'UnityServe Volunteers'),
    'Community Food Drive',
    'Collecting and sorting shelf-stable food for local pantry partners.',
    'UnityServe Volunteer Center',
    CURRENT_DATE + INTERVAL '71 days'
),
(
    (SELECT organization_id FROM organization WHERE name = 'UnityServe Volunteers'),
    'Spring Neighborhood Cleanup',
    'Removing litter and restoring public spaces with local volunteers.',
    'Mill Creek Trailhead',
    CURRENT_DATE + INTERVAL '78 days'
),
(
    (SELECT organization_id FROM organization WHERE name = 'UnityServe Volunteers'),
    'Charity Donation Sort',
    'Organizing clothing and household donations for regional charities.',
    'South County Donation Hub',
    CURRENT_DATE + INTERVAL '85 days'
),
(
    (SELECT organization_id FROM organization WHERE name = 'UnityServe Volunteers'),
    'Senior Outreach Visits',
    'Coordinating friendly visits and practical support for isolated seniors.',
    'Pinecrest Senior Community',
    CURRENT_DATE + INTERVAL '92 days'
),
(
    (SELECT organization_id FROM organization WHERE name = 'UnityServe Volunteers'),
    'Backpack Resource Giveaway',
    'Preparing school supplies and resource kits for students before the school year.',
    'Community Youth Center',
    CURRENT_DATE + INTERVAL '99 days'
);

-- ========================================
-- Project Category Associations
-- ========================================

INSERT INTO project_category (project_id, category_id)
VALUES
((SELECT project_id FROM project WHERE title = 'Neighborhood Home Repair Day'), (SELECT category_id FROM category WHERE name = 'Community Development')),
((SELECT project_id FROM project WHERE title = 'Accessible Ramp Construction'), (SELECT category_id FROM category WHERE name = 'Community Development')),
((SELECT project_id FROM project WHERE title = 'Accessible Ramp Construction'), (SELECT category_id FROM category WHERE name = 'Health and Wellness')),
((SELECT project_id FROM project WHERE title = 'Community Hall Renovation'), (SELECT category_id FROM category WHERE name = 'Community Development')),
((SELECT project_id FROM project WHERE title = 'Safe Play Space Build'), (SELECT category_id FROM category WHERE name = 'Community Development')),
((SELECT project_id FROM project WHERE title = 'Safe Play Space Build'), (SELECT category_id FROM category WHERE name = 'Health and Wellness')),
((SELECT project_id FROM project WHERE title = 'Shelter Courtyard Improvements'), (SELECT category_id FROM category WHERE name = 'Community Development')),
((SELECT project_id FROM project WHERE title = 'Shelter Courtyard Improvements'), (SELECT category_id FROM category WHERE name = 'Volunteer Service')),
((SELECT project_id FROM project WHERE title = 'Spring Community Garden Launch'), (SELECT category_id FROM category WHERE name = 'Environment')),
((SELECT project_id FROM project WHERE title = 'Spring Community Garden Launch'), (SELECT category_id FROM category WHERE name = 'Community Development')),
((SELECT project_id FROM project WHERE title = 'Urban Orchard Planting'), (SELECT category_id FROM category WHERE name = 'Environment')),
((SELECT project_id FROM project WHERE title = 'Neighborhood Compost Workshop'), (SELECT category_id FROM category WHERE name = 'Environment')),
((SELECT project_id FROM project WHERE title = 'Neighborhood Compost Workshop'), (SELECT category_id FROM category WHERE name = 'Education')),
((SELECT project_id FROM project WHERE title = 'Food Sustainability Fair'), (SELECT category_id FROM category WHERE name = 'Environment')),
((SELECT project_id FROM project WHERE title = 'Food Sustainability Fair'), (SELECT category_id FROM category WHERE name = 'Education')),
((SELECT project_id FROM project WHERE title = 'Summer Pollinator Garden'), (SELECT category_id FROM category WHERE name = 'Environment')),
((SELECT project_id FROM project WHERE title = 'Community Food Drive'), (SELECT category_id FROM category WHERE name = 'Volunteer Service')),
((SELECT project_id FROM project WHERE title = 'Community Food Drive'), (SELECT category_id FROM category WHERE name = 'Health and Wellness')),
((SELECT project_id FROM project WHERE title = 'Spring Neighborhood Cleanup'), (SELECT category_id FROM category WHERE name = 'Environment')),
((SELECT project_id FROM project WHERE title = 'Spring Neighborhood Cleanup'), (SELECT category_id FROM category WHERE name = 'Volunteer Service')),
((SELECT project_id FROM project WHERE title = 'Charity Donation Sort'), (SELECT category_id FROM category WHERE name = 'Volunteer Service')),
((SELECT project_id FROM project WHERE title = 'Senior Outreach Visits'), (SELECT category_id FROM category WHERE name = 'Health and Wellness')),
((SELECT project_id FROM project WHERE title = 'Senior Outreach Visits'), (SELECT category_id FROM category WHERE name = 'Volunteer Service')),
((SELECT project_id FROM project WHERE title = 'Backpack Resource Giveaway'), (SELECT category_id FROM category WHERE name = 'Education')),
((SELECT project_id FROM project WHERE title = 'Backpack Resource Giveaway'), (SELECT category_id FROM category WHERE name = 'Volunteer Service'));
