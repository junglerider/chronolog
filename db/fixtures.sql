-- Chronolog Fixtures
-- sample data for testing and evaluation

-- CAUTION! THIS SCRIPT ERASES AND OVERWRITES ALL CHRONOLOG DATA.

DELETE FROM time_log;
DELETE FROM task;
DELETE FROM customer;
DELETE FROM user;
DELETE FROM contact;
DELETE FROM employee;
DELETE FROM person;
DELETE FROM organisation;
DELETE FROM entity;

INSERT INTO entity (`id`, `street_address`, `city`, `state_province`, `postcode`, `country`, `first_contact`, `last_contact`) VALUES
( 1, 'Baldener Str. 12', 'Hochstadt', null, '28711', 'Germany', '2017-10-22', '2017-12-09'),
( 2, 'Barring St 87', 'Hastings', null, '98781', 'United Kingdom', '2015-06-14', '2018-01-11'),
( 3, 'Strada Vittoria E. 115/a', 'Bologna', 'Emilia Romagna', '44512', 'Italy', '2019-08-14', null),
( 4, 'Avenida Vera Cruz 98', 'Logroño', 'La Rioja', '39301', 'Spain', '2018-04-12', null),
( 5, 'Rue Saint Pierre 116', 'Toulouse', null, '76416', 'France', '2015-10-02', '2020-09-17'),
( 6, 'Turmhof 21', 'Frankfurt', null, '67800', 'Germany', '2016-11-03', '2018-11-01'),
( 7, 'Berliner Allee 254', 'Düsseldorf', 'NRW', '43001', 'Germany', '2015-04-07', '2016-04-03'),
( 8, 'Abbey Rd. 78', 'Birmingham', null, '77811', 'United Kingdom', '2015-11-03', '2018-11-01'),
( 9, 'Rue Valade 33/9', 'Paris', null, '62583', 'France', '2015-17-03', '2020-09-01'),
(10, 'Allée de Barcelone 12', 'Montpellier', null, '49041', 'France', '2015-02-07', '2018-07-20'),
(11, 'Calle León 41c', 'Madrid', null, '98817', 'Spain', '2016-11-03', '2018-11-01'),
(12, 'Via Sforza 119', 'Roma', null, '80816', 'Italy', '2015-21-03', '2020-08-01'),
(13, 'Piazza di Esquellino', 'Genoa', null, '25001', 'Italy', '2016-03-07', '2018-04-01'),
(14, 'Mozartstraße 98', 'Karlsruhe', null, '78021', 'Germany', '2017-08-30', '2017-11-30'),
(15, 'Westbourne Grove 190', 'Chester', null, '43001', 'United Kingdom', '2017-04-08', '2016-04-01'),
(16, 'Ashby Court 62', 'Edinburgh', 'Scotland', '78021', 'United Kingdom', '2017-03-30', '2017-10-30'),
(17, 'Boulevard Vencent Auriol 370', 'Reims', null, '04772', 'France', '2015-02-22', '2017-09-28'),
(18, 'Calle del Rei 87', 'Granada', null, '43001', 'Spain', '2015-04-07', '2016-04-03'),
(19, 'Avenida Paloma 65', 'Valladolid', null, '38171', 'Spain', '2017-08-30', '2017-11-30'),
(20, 'Callejón del Sur 124', 'Valencia', 'Costa Blanca', '66301', 'Spain', '2015-05-16', '2019-05-09'),
(21, 'Ebener Weg 60', 'Freiburg', null, '79266', 'Germany', '2015-05-16', null),
(22, 'Via Buonarotti 45c', 'Milano', null, '79361', 'Italy', '2015-04-01', '2017-12-31'),
(23, 'Via Giuseppe Verdi 304', 'Ancona', 'E.R.', '87451', 'Italy', '2015-07-12', '2020-07-19'),
(24, 'Rue du Chevaleret 75', 'Marseille', 'Côte d Azur', '87451', 'France', '2015-06-12', '2020-01-20'),
(25, 'Ocean Drive 112', 'Newport', 'Wales', '55791', 'United Kingdom', '2014-05-16', null),
(26, 'Rue de Châtillon 262', 'Nantes', 'Bretagne', '90802', 'France', '2018-21-04', null),
(27, 'Rue Fiarret 11', 'Lyon', null, '89878', 'France', '2014-04-18', '2015-01-31'),
(28, 'Fairbain St 39', 'London', null, '80971', 'United Kingdom', '2018-01-03', null),
(29, 'Via Garibaldi 11/8', 'Cagliari', 'Sardegna', '90802', 'Italy', '2018-01-04', null),
(30, 'Piazza Cosimo 35', 'Napoli', null, '89878', 'Italy', '2014-04-18', '2017-08-31'),
(31, 'Via Santa Sofia 96', 'Firenze', null, '31109', 'Italy', '2018-09-06', null),
(32, 'Siebenstr. 99a', 'Hopfingen', null, '80971', 'Germany', '2019-01-04', '2020-01-17'),
(33, 'Bulevar Antoniera 242', 'Málaga', 'Andalucia', '93945', 'Spain', '2019-01-04', null),
(34, 'Parry Street 11', 'Manchester', null, '87671', 'United Kingdom', '2014-05-19', '2016-02-27'),
(35, 'Alte Markgasse 2', 'Hamburg', null, '12003', 'Germany', '2014-04-18', '2016-08-27'),
(36, 'Bahnstraße 10', 'Kassel', null, '53001', 'Germany', '2017-10-19', null),
(37, 'Calzada Porto 32', 'Oviedo', null, '12397', 'Spain', '2014-04-18', '2016-08-27'),
(38, 'Winsland Mews 271', 'Sheffield', null, '15609', 'United Kingdom', '2018-10-29', '2019-05-11'),
(39, 'Wellington Court 76a', 'Norwich', null, '65560', 'United Kingdom', '2016-11-24', null),
(40, 'Calle Maricon 117-18', 'Burgos', null, '24005', 'Spain', '2018-09-29', null),
(41, 'Corso Firenze 178', 'Torino', 'Piedmont', '87712', 'Italy', '2015-02-22', '2018-09-27'),
(42, 'Rue Saint-Martin 79', 'Poitiers', null, '08181', 'France', '2016-05-06', null),
(43, 'Quai de Jemmapes 490/11', 'Bordeaux', 'Novuelle Aquitaine', '56621', 'France', '2014-02-21', '2019-09-27'),
(44, 'Am Nordpark 237', 'München', null, '85601', 'Germany', '2018-05-14', null),
(45, 'Liberty Park 116', 'Cardiff', null, '76002', 'United Kingdom', '2016-06-29', '2016-12-27'),
(46, 'Flensburger Str.', 'Essen', null, '41090', 'Germany', '2017-09-29', '2020-01-14'),
(47, 'Calle San Antonio 30-2', 'Bilbao', 'Biscaya', '83925', 'Spain', '2016-02-18', '2018-01-17'),
(48, 'Calle la Alberca 9', 'Murcia', null, '14391', 'Spain', '2013-02-11', '2015-10-10'),
(49, 'Via Felipe Romani 72', 'Livorno', null, '98221', 'Italy', '2013-12-11', '2016-03-07'),
(50, 'Boulevard de Strasbourg 301-D', 'Orléans', null, '27540', 'France', '2015-12-12', '2018-04-07'),
(51, 'Severinstr. 100', 'Dresden', 'Sachsen-Anhalt', '70881', 'Germany', '2015-03-01', null),
(52, 'Beckhampton St 17', 'Swindon', null, '46931', 'United Kingdom', '2014-10-18', null),
(53, 'Rotanda Lecera 347', 'Salamanca', null, '14017', 'Spain', '2018-04-10', '2019-09-08'),
(54, 'Salita Marinara 297', 'Bari', null, '48172', 'Italy', '2017-05-02', '2019-10-08'),
(55, 'Cité de Trévise 23', 'Saint-Étienne', null, '86151', 'France', '2016-04-02', '2020-07-08');

INSERT INTO person (`id`, `type`, `title`, `first_name`, `last_name`, `nick_name`) VALUES
( 1, null, 'Mr.', 'Jochen', 'Althoff', null),
( 2, null, 'Ms.', 'Margareth', 'Wiley', 'Maggie'),
( 3, 'EMP', 'Mr.', 'Lorenzo', 'Regio', null),
( 7, null, 'Mr.', 'Karl-Gustav', 'Müller', null),
( 8, 'EMP', 'Mr.', 'James', 'Kenning', null),
( 9, null, 'Mr.', 'Pierre-Arnand', 'Brodeur', null),
(10, null, 'Mrs.', 'Janine', 'Bisset-Laurent', null),
(15, null, 'Mrs.', 'Kathren', 'Leonard', null),
(18, 'EMP', 'Ms.', 'Gabriella', 'Martinez', null),
(19, null, 'Mr.', 'Alberto', 'Rodríguez', null),
(21, 'EMP', 'Mr.', 'Mehmed', 'Çevik', null),
(22, null, 'Mr.', 'Salvatore', 'Moretti', null),
(25, null, 'Mr.', 'Jonathan', 'Wilson-Everett', null),
(26, null, 'Mr.', 'Francois', 'Pelletier', null),
(27, null, 'Mrs.', 'Eloise', 'Dupont', null),
(29, null, 'Mrs.', 'Maria C.', 'Romano', null),
(31, null, 'Mr.', 'Ugo', 'Esposito', null),
(32, null, 'Ms.', 'Anette', 'Dauben', null),
(33, null, 'Mrs.', 'Maria', 'De León', null),
(36, null, 'Mr.', 'Günther', 'Weidner', null),
(37, null, 'Mr.', 'Juan-Gabriel', 'Almenarez', null),
(38, null, 'Mrs.', 'Dorothee', 'Baker', null),
(40, null, 'Mr.', 'Pedro A.', 'Ortega', null),
(41, null, 'Mr.', 'Matteo', 'Pietra', null),
(42, null, 'Mr.', 'Alexandre', 'Caron', null),
(44, null, 'Mr.', 'Axel', 'Hofmeier', null),
(47, null, 'Ms.', 'Elena', 'Torres', null),
(50, null, 'Mrs.', 'Danielle', 'Legrand', null),
(51, null, 'Mr.', 'Michael', 'Springer', null),
(52, null, 'Mrs.', 'Florence', 'Hughes', null),
(53, null, 'Mr.', 'Carlos', 'Ruíz', null),
(54, null, 'Ms.', 'Chiarina', 'Ricci', null),
(55, null, 'Mr.', 'Victor', 'Mullins', null);

INSERT INTO user (`id`, `person_id`, `is_active`, `login`, `password`, `visits`, `last_visit`) VALUES
( 1,  3, 1, 'enzo', null, 114, '2020-08-18'),
( 2,  8, 1, 'james', null, 21, '2020-08-16'),
( 3, 18, 1, 'gabriella', null, 78, '2020-08-17'),
( 4, 21, 1, 'mehmed', null, 17, '2020-08-15');

INSERT INTO organisation (`id`, `type`, `name`, `industry`) VALUES
( 4, 'CUS', 'Banco Santander', 'Finance'),
( 5, null, 'Société Générale', 'Finance'),
( 6, null, 'Deutsche Bank', 'Finance'),
(11, null, 'Inmobiliaria Colonial', 'Real Estate'),
(12, null, 'Exor N.V.', 'Holding'),
(13, 'GOV', 'Servizio Elettrico Nazionale S.p.A.', null),
(14, 'CUS', 'Werthmann AG', null),
(16, null, 'HSBC Group', 'Finance'),
(17, null, 'BNP Paribas', 'Finance'),
(20, null, 'MV Automobil S.p.A.', null),
(23, 'SUP', 'Moto Bianchi S.r.l.', null),
(24, 'CUS', 'InfoCom Leblanc SARL', null),
(28, 'PRS', 'Barclays Plc', 'Finance'),
(30, null, 'Servizi Garibaldi S.r.l.', null),
(34, 'SUP', 'Spalding Limited', 'Retail'),
(35, null, 'Hamburger Hochbau AG', 'Construction'),
(39, null, 'Norwich Construction & Engineering Ltd.', 'Construction'),
(43, null, 'Berger Construction SARL', 'Construction'),
(45, 'ASC', 'Computec Ltd.', null),
(46, 'PRS', 'Müller DataCom GmbH', null),
(48, null, 'Inditex S.p.A.', null),
(49, 'PRS', 'Telefónica Italia', 'Telecom');

INSERT INTO customer (`id`, `name`, `organisation_id`, `is_retired`, `notes`) VALUES
(1, 'Werthmann', 14, 0, 'German client'),
(2, 'Banco Santander Logroño', 4, 0, 'Spanish client'),
(3, 'InfoCom France', 24, 0, 'French client');

INSERT INTO employee (`id`, `organisation_id`, `person_id`, `position`) VALUES
( 1,  4, 19, 'Accout Manager'),
( 2,  4, 53, 'Chief Technical Officer'),
( 3, 14, 1, 'EDV Leiter'),
( 4, 14, 36, 'Head of Sales'),
( 5, 14, 44, 'Business Manager'),
( 6, 24, 9, 'Business Manager'),
( 7, 24, 42, 'C.E.O.'),
( 8, 13, 22, 'Customer Relationship Manager'),
( 9, 23, 31, 'Sales Manager'),
(10, 28, 2, 'Account Executive'),
(11, 34, 15, 'Logistics Manager'),
(12, 34, 25, 'International Operations Manager'),
(13, 45, 52, 'Office Manager'),
(14, 46, 36, 'Sales Manager'),
(15, 49, 22, 'Marketing Executive'),
(16,  5, 50, 'Chief of Operations'),
(17,  6, 51, 'Risk Analyst'),
(18, 16, 38, 'Operations Manager'),
(19, 30, 54, 'Customer Service'),
(20, 43, 10, 'Senior Marketing Analyst'),
(21, 43, 17, 'Quantitative Analyst');

INSERT INTO contact (`id`, `entity_id`, `type`, `entry`) VALUES
( 1, 55, 'PHO', '555-09121'),
( 2, 55, 'MOB', '555-76188'),
( 3, 49, 'PHO', '444-99918'),
( 4, 49, 'FAX', '444-99917'),
( 5, 49, 'EML', 'info.livo@telefonica.it'),
( 6, 48, 'EML', 'info@inditex.es'),
( 7, 46, 'WRK', '555-641181/2'),
( 8, 53, 'EML', 'carlos.ruiz@banco-santander.es'),
( 9, 54, 'EML', 'ricci.chiarina@garibaldi.it'),
(10, 53, 'WRK', '555-898127'),
(11, 50, 'EML', 'danielle.legrand@societe-generale.com'),
(12, 50, 'WAP', 'daniellegrande'),
(13, 52, 'PHO', '555-740341'),
(14, 52, 'LIN', 'florentina7871'),
(15, 51, 'EML', 'm.springer@deutsche-bank.de'),
(16, 51, 'WRK', '555-0909881'),
(17, 37, 'EML', 'gabriel.juan112@gmail.com'),
(18, 33, 'EML', 'deleon111@gmail.es'),
(19, 38, 'MOB', '099-99077099'),
(20, 38, 'EML', 'dorothee.baker@hsbc.co.uk'),
(21, 44, 'EML', 'axel.hofmeier@werthmann.de'),
(22, 44, 'WAP', 'axelhofer333'),
(23, 42, 'PHO', '111-8671291'),
(24, 40, 'EML', 'pedro.alberto.ortega@laposte.es'),
(25, 36, 'EML', 'guenther.weidner@werthmann.de'),
(26, 36, 'WRK', '555-66102785/6'),
(27,  1, 'EML', 'jochen.althoff@werthmann.de'),
(28,  1, 'PHO', '555-303001'),
(29,  2, 'MOB', '091-7965891'),
(30,  3, 'EML', 'enzo.regio@ourcompany.com'),
(31, 18, 'EML', 'gabriella.martinez@ourcompany.com'),
(32, 18, 'WRK', '555-402291'),
(33,  8, 'EML', 'james.kenning@ourcompany.com'),
(34,  8, 'MOB', '012-3976145'),
(35, 21, 'EML', 'mehmed.cevik@ourcompany.com'),
(36,  4, 'PHO', '981-98118991'),
(37,  5, 'EML', 'info@societe-generale.fr'),
(38,  5, 'PHO', '555-793711'),
(39,  6, 'EML', 'contact@deutsche-bank.de'),
(40,  6, 'WRK', '555-36851');

INSERT INTO `task` (`id`, `customer_id`, `user_id`, `parent_id`, `name`, `description`, `is_active`,  `is_closed`, `is_leaf`) VALUES
( 1, 1, null, null, 'Werthmann Project', 'Development of automated QA system', 0, 1, 0),
( 2, 1, null, 1, 'Werthmann Planning', null, 0, 1, 0),
( 3, null, null, 1, 'Werthmann Implementation', null, 1, 0, 0),
( 4, 2, null, null, 'Banco Santander Project', 'Online transaction processing system', 1, 0, 0),
( 5, 2, null, null, 'Banco Santander Requirements', 'Requirements Analysis', 0, 1, 0),
( 6, 3, null, null, 'InfoCom Project', 'Neural network quantitative analytics', 1, 0, 0),
( 7, 1, 1, 2, 'Gathering requirements', null, 0, 1, 1),
( 8, 1, 1, 2, 'Producing specifications', null, 0, 1, 1),
( 9, 1, 2, 2, 'Implementation planning', null, 0, 1, 1),
(10, 1, 1, 3, 'Sensor data acquistion', null, 1, 0, 1),
(11, 1, 2, 3, 'Programming evaluation logic', null, 1, 0, 1),
(12, 1, 2, 3, 'Programming scoring system', null, 1, 0, 1),
(13, 1, 2, 3, 'UI implementation', null, 1, 0, 1),
(14, 1, 1, 3, 'Storage and data design', null, 1, 0, 1),
(15, 1, null, 3, 'Integrating storage and UI', null, 1, 0, 1),
(16, 2, null, 5, 'Meetings', null, 0, 1, 1),
(17, 2, 3, 5, 'Analysis Phase I', null, 0, 1, 1),
(18, 2, 3, 5, 'Analysis Phase II', null, 0, 1, 1),
(19, 2, 1, 5, 'Project Proposal', null, 0, 1, 1),
(20, 2, 4, 4, 'Database modelling', null, 0, 1, 1),
(21, 2, 3, 4, 'Database implementation', null, 1, 0, 1),
(22, 2, 3, 4, 'API programming', null, 1, 0, 1),
(23, 2, 3, 4, 'API master module', null, 1, 0, 1),
(24, 2, 4, 4, 'Authentication module', null, 1, 0, 1),
(25, 2, 3, 4, 'API services', null, 1, 0, 1),
(26, 2, 4, 4, 'Work flow logic TG-61', null, 1, 0, 1),
(27, 2, 4, 4, 'Work flow logic TG-87', null, 1, 0, 1),
(28, 2, 4, 4, 'Work flow logic TG-72', null, 1, 0, 1),
(29, 2, 3, 4, 'Business logic BG-11', null, 1, 0, 1),
(30, 2, 3, 4, 'Business logic BG-25', null, 1, 0, 1),
(31, 2, 3, 4, 'Business logic BG-18', null, 1, 0, 1),
(32, 2, null, 4, 'Unit tests', null, 1, 0, 1),
(33, 2, null, 4, 'Acceptance testing', null, 1, 0, 1),
(34, 3, null, 6, 'ANN model development', null, 1, 0, 1),
(35, 3, 2, 6, 'Training dataset phase 1', null, 1, 0, 1),
(36, 3, 2, 6, 'Training dataset phase 2', null, 1, 0, 1),
(37, 3, 2, 6, 'Training dataset phase 3', null, 1, 0, 1),
(38, 3, null, 6, 'Test implementation', null, 1, 0, 1),
(39, 3, 1, 6, 'Clustering extension', null, 1, 0, 1),
(40, 3, 2, 6, 'Metadata programming', null, 1, 0, 1),
(41, 3, 1, 6, 'Set 1 algorithms', null, 1, 0, 1),
(42, 3, 1, 6, 'Set 2 algorithms', null, 1, 0, 1),
(43, 3, 2, 6, 'Set 3 algorithms', null, 1, 0, 1),
(44, 3, 1, 6, 'Optimisation and tuning', null, 1, 0, 1),
(45, 3, 2, 6, 'Adding tensors', null, 1, 0, 1);

INSERT INTO time_log (`id`, `date`, `duration`, `task_id`, `user_id`, `description`) VALUES
( 1, (SELECT DATE('now','-13 day')), 4, 7, 1, 'Created requirements draft document'),
( 2, (SELECT DATE('now','-13 day')), 4, 7, 1, 'Discussed requirements with client'),
( 3, (SELECT DATE('now','-12 day')), 8, 7, 1, 'Completed requirements'),
( 4, (SELECT DATE('now','-11 day')), 8, 8, 1, 'Created specifications'),
( 5, (SELECT DATE('now','-10 day')), 5.5, 8, 1, 'Completed specifications'),
( 6, (SELECT DATE('now','-10 day')), 2.5, 8, 1, 'Team discussion'),
( 7, (SELECT DATE('now','-9 day')), 2, 8, 1, 'Review meeting'),
( 8, (SELECT DATE('now','-9 day')), 2, 16, 1, 'Sprint planning meeting'),
( 9, (SELECT DATE('now','-9 day')), 4, 10, 1, 'Conducted test series'),
(10, (SELECT DATE('now','-8 day')), 8, 10, 1, 'Programmed calibration routines'),
(11, (SELECT DATE('now','-7 day')), 3, 15, 1, 'Data model development'),
(12, (SELECT DATE('now','-7 day')), 2, 10, 1, 'Unit testing'),
(13, (SELECT DATE('now','-7 day')), 1, 14, 1, 'Verified requirement details with customer'),
(14, (SELECT DATE('now','-7 day')), 2, 15, 1, 'Data structure implementation'),
(15, (SELECT DATE('now','-6 day')), 6, 14, 1, 'Programmed I/O'),
(16, (SELECT DATE('now','-6 day')), 2, 14, 1, 'Tested I/O'),
(17, (SELECT DATE('now','-5 day')), 4.5, 32, 1, 'Wrote red/green test skeleton for FI modules'),
(18, (SELECT DATE('now','-5 day')), 2.5, 33, 1, 'Created acceptance test guide'),
(19, (SELECT DATE('now','-5 day')), 1, 33, 1, 'Discussed testing guideline with team'),
(20, (SELECT DATE('now','-4 day')), 8, 33, 1, 'Implemented headless tests'),
(21, (SELECT DATE('now','-3 day')), 4, 41, 1, 'Began coding'),
(22, (SELECT DATE('now','-3 day')), 4, 42, 1, 'Began coding'),
(23, (SELECT DATE('now','-2 day')), 8, 39, 1, 'Programmed delta channel clustering'),
(24, (SELECT DATE('now','-1 day')), 4, 44, 1, 'Model tuning phase 1'),
(25, (SELECT DATE('now','-1 day')), 4, 41, 1, 'Completed set 1 PE algorithms'),
(26,(SELECT DATE('now')), 2, 44, 1, 'Model tuning phase 2'),
(27,(SELECT DATE('now')), 3, 42, 1, 'Completed implementation'),
(28,(SELECT DATE('now')), 3, 38, 1, 'Added test cases'),

(29,(SELECT DATE('now', '-13 day')), 4, 11, 2, 'Programmed environment parameter acquisition'),
(30,(SELECT DATE('now', '-13 day')), 4, 12, 2, 'Programmed scoring data model'),
(31,(SELECT DATE('now', '-12 day')), 1, 12, 2, 'Refinement session with colleagues'),
(32,(SELECT DATE('now', '-12 day')), 6, 12, 2, 'Added computation and scoring algorithms'),
(33,(SELECT DATE('now', '-12 day')), 1, 11, 2, 'Created Eval class'),
(34,(SELECT DATE('now', '-11 day')), 8, 11, 2, 'Completed algorithms for evaluation'),
(35,(SELECT DATE('now', '-10 day')), 2, 15, 2, 'Discussed storage parameters with team'),
(36,(SELECT DATE('now', '-10 day')), 6, 13, 2, 'Draft implementation'),
(37,(SELECT DATE('now', '-9 day')), 3, 32, 2, 'Supported colleagues with unit test creation'),
(38,(SELECT DATE('now', '-9 day')), 1, 33, 2, 'Discussed testing framework'),
(39,(SELECT DATE('now', '-9 day')), 4, 13, 2, 'Added paging and selection'),
(40,(SELECT DATE('now', '-8 day')), 1.25, 35, 2, 'Coordinated work with colleagues'),
(41,(SELECT DATE('now', '-8 day')), 1.75, 36, 2, 'Discussed expected results and created drafts'),
(42,(SELECT DATE('now', '-8 day')), 5, 35, 2, 'Developed MC-3 inputs'),
(43,(SELECT DATE('now', '-7 day')), 4, 35, 2, 'Completed phase 1 training inputs'),
(44,(SELECT DATE('now', '-7 day')), 4, 36, 2, 'Developed phase 2 model inputs'),
(45,(SELECT DATE('now', '-6 day')), 8, 37, 2, 'Completed phase 3 dataset'),
(46,(SELECT DATE('now', '-5 day')), 2, 34, 2, 'Review of model components'),
(47,(SELECT DATE('now', '-5 day')), 1.25, 45, 2, 'Discussed requirements'),
(48,(SELECT DATE('now', '-5 day')), 4.75, 38, 2, 'Finalised acceptance test definitions'),
(49,(SELECT DATE('now', '-4 day')), 1, 40, 2, 'Discussed DB issues with team'),
(50,(SELECT DATE('now', '-4 day')), 1.5, 40, 2, 'Resolved DB issues with Ops'),
(51,(SELECT DATE('now', '-4 day')), 1, 38, 2, 'Review'),
(52,(SELECT DATE('now', '-4 day')), 4.5, 43, 2, 'Coordinated interfaces with Enzo and started implementation'),
(53,(SELECT DATE('now', '-3 day')), 8, 40, 2, 'Completed metadata sets'),
(54,(SELECT DATE('now', '-2 day')), 1, 43, 2, 'Fixed classification problem'),
(55,(SELECT DATE('now', '-2 day')), 1, 37, 2, 'Review'),
(56,(SELECT DATE('now', '-2 day')), 2, 36, 2, 'Review'),
(57,(SELECT DATE('now', '-2 day')), 4, 40, 2, 'Added data for edge cases'),
(58,(SELECT DATE('now', '-1 day')), 8, 45, 2, 'Completed recursive tensor network'),
(59,(SELECT DATE('now')), 1, 13, 2, 'Reviewed customer feedback'),
(60,(SELECT DATE('now')), 2, 13, 2, 'Applied fixed to UI problems'),
(61,(SELECT DATE('now')), 5, 38, 2, 'Supported testing efforts and added new cases'),

(62,(SELECT DATE('now', '-13 day')), 5, 15, 3, 'Programmed UI for storage access'),
(63,(SELECT DATE('now', '-13 day')), 3, 34, 3, 'Read and corrected documentation'),
(64,(SELECT DATE('now', '-12 day')), 4, 21, 3, 'Entity modelling'),
(65,(SELECT DATE('now', '-12 day')), 4, 21, 3, 'Created draft model in live system'),
(66,(SELECT DATE('now', '-11 day')), 8, 21, 3, 'Completed DB'),
(67,(SELECT DATE('now', '-10 day')), 3, 22, 3, 'Programmed Skeleton API'),
(68,(SELECT DATE('now', '-10 day')), 5, 22, 3, 'Implemented query parser and builder'),
(69,(SELECT DATE('now', '-9 day')), 8, 22, 3, 'Completed API v1 endpoints'),
(70,(SELECT DATE('now', '-8 day')), 4, 23, 3, 'Connected API to live system'),
(71,(SELECT DATE('now', '-8 day')), 4, 23, 3, 'Fixed API issues'),
(72,(SELECT DATE('now', '-7 day')), 6.25, 25, 3, 'Programmed service routines'),
(73,(SELECT DATE('now', '-7 day')), 1.75, 21, 3, 'Reviewed DB model with client'),
(74,(SELECT DATE('now', '-6 day')), 4, 25, 3, 'Completed services, fixed issues with CORS access'),
(75,(SELECT DATE('now', '-6 day')), 1, 23, 3, 'Review meeting'),
(76,(SELECT DATE('now', '-6 day')), 3, 33, 3, 'Supported client with technical QA'),
(77,(SELECT DATE('now', '-5 day')), 1, 29, 3, 'Studied requirement'),
(78,(SELECT DATE('now', '-5 day')), 7, 29, 3, 'Implemented constraints'),
(79,(SELECT DATE('now', '-4 day')), 4, 29, 3, 'Completed implementation'),
(80,(SELECT DATE('now', '-4 day')), 4, 30, 3, 'Programmed interfaces'),
(81,(SELECT DATE('now', '-3 day')), 6.5, 30, 3, 'Finished service methods'),
(82,(SELECT DATE('now', '-3 day')), 1.5, 31, 3, 'Programmed descriptors and clarified missing categories'),
(83,(SELECT DATE('now', '-2 day')), 8, 31, 3, 'Programmed all service classes, added tests'),
(84,(SELECT DATE('now', '-1 day')), 2.5, 31, 3, 'Test and review'),
(85,(SELECT DATE('now', '-1 day')), 2.5, 30, 3, 'Test and review'),
(86,(SELECT DATE('now', '-1 day')), 3, 32, 3, 'Added test for business logic services'),
(87,(SELECT DATE('now')), 8, 34, 3, 'Reviewed classification problem, increased nodes, tuned transformation'),

(88,(SELECT DATE('now', '-6 day')), 4, 15, 4, 'Added XML descriptors'),
(89,(SELECT DATE('now', '-6 day')), 4, 34, 4, 'Designed draft model with logarithmic delay'),
(90,(SELECT DATE('now', '-5 day')), 4, 24, 4, 'Gathered security requirements'),
(91,(SELECT DATE('now', '-5 day')), 4, 24, 4, 'Onsite client meeting'),
(92,(SELECT DATE('now', '-4 day')), 2, 26, 4, 'Created diagrams'),
(93,(SELECT DATE('now', '-4 day')), 4, 27, 4, 'Created diagrams and charts'),
(94,(SELECT DATE('now', '-4 day')), 2, 28, 4, 'Resolved conflicting requirements with client'),
(95,(SELECT DATE('now', '-3 day')), 6, 26, 4, 'Implementation, test and debugging'),
(96,(SELECT DATE('now', '-3 day')), 2, 24, 4, 'Started implementation based on transient tokens'),
(97,(SELECT DATE('now', '-2 day')), 8, 24, 4, 'Completed implementation, added user IDs'),
(98,(SELECT DATE('now', '-1 day')), 6, 28, 4, 'Programmed asynchronous flow'),
(99,(SELECT DATE('now', '-1 day')), 2, 27, 4, 'Added conditional termination scenario'),
(100,(SELECT DATE('now')), 8, 27, 4, 'Completed work flow');

INSERT INTO time_clock (`user_id`, `date`, `arrival_time`, `departure_time`, `work_duration`, `json_log`) VALUES
(1,(SELECT DATE('now', '-13 day')), '08:35:50', '17:34:39', 7.98, '["08:35:50","12:50:31","13:50:31","17:34:39"]'),
(1,(SELECT DATE('now', '-12 day')), '08:15:55', '17:28:23', 8.21, '["08:15:55","12:27:26","13:27:26","17:28:23"]'),
(1,(SELECT DATE('now', '-11 day')), '06:55:01', '16:10:58', 8.27, '["06:55:01","11:14:40","12:14:40","16:10:58"]'),
(1,(SELECT DATE('now', '-10 day')), '07:35:36', '16:35:43', 8, '["07:35:36","11:55:35","12:55:35","16:35:43"]'),
(1,(SELECT DATE('now', '-9 day')), '08:07:54', '17:19:45', 8.2, '["08:07:54","12:25:25","13:25:25","17:19:45"]'),
(1,(SELECT DATE('now', '-8 day')), '07:13:18', '16:34:38', 8.36, '["07:13:18","11:27:17","12:27:17","16:34:38"]'),
(1,(SELECT DATE('now', '-7 day')), '06:57:29', '15:59:48', 8.04, '["06:57:29","11:15:43","12:15:43","15:59:48"]'),
(1,(SELECT DATE('now', '-6 day')), '07:28:48', '16:52:16', 8.39, '["07:28:48","11:44:44","12:44:44","16:52:16"]'),
(1,(SELECT DATE('now', '-5 day')), '09:17:42', '18:18:58', 8.02, '["09:17:42","13:33:46","14:33:46","18:18:58"]'),
(1,(SELECT DATE('now', '-4 day')), '07:35:53', '16:35:02', 7.99, '["07:35:53","11:48:21","12:48:21","16:35:02"]'),
(1,(SELECT DATE('now', '-3 day')), '09:23:01', '18:42:02', 8.32, '["09:23:01","13:42:26","14:42:26","18:42:02"]'),
(1,(SELECT DATE('now', '-2 day')), '08:10:46', '17:22:02', 8.19, '["08:10:46","12:24:14","13:24:14","17:22:02"]'),
(1,(SELECT DATE('now', '-1 day')), '08:52:28', '18:15:28', 8.38, '["08:52:28","13:10:47","14:10:47","18:15:28"]'),
(1,(SELECT DATE('now')), '08:06:48', '17:21:56', 8.25, '["08:06:48","12:17:35","13:17:35","17:21:56"]'),

(2,(SELECT DATE('now', '-13 day')), '09:18:21', '18:33:39', 8.26, '["09:18:21","13:37:53","14:37:53","18:33:39"]'),
(2,(SELECT DATE('now', '-12 day')), '07:58:02', '17:10:08', 8.2, '["07:58:02","12:16:04","13:16:04","17:10:08"]'),
(2,(SELECT DATE('now', '-11 day')), '07:46:00', '17:00:15', 8.24, '["07:46:00","12:04:48","13:04:48","17:00:15"]'),
(2,(SELECT DATE('now', '-10 day')), '07:09:39', '16:22:52', 8.22, '["07:09:39","11:24:56","12:24:56","16:22:52"]'),
(2,(SELECT DATE('now', '-9 day')), '06:52:13', '15:53:20', 8.02, '["06:52:13","11:08:09","12:08:09","15:53:20"]'),
(2,(SELECT DATE('now', '-8 day')), '09:07:10', '18:15:47', 8.14, '["09:07:10","13:26:43","14:26:43","18:15:47"]'),
(2,(SELECT DATE('now', '-7 day')), '07:05:38', '16:24:48', 8.32, '["07:05:38","11:22:23","12:22:23","16:24:48"]'),
(2,(SELECT DATE('now', '-6 day')), '08:40:04', '17:51:40', 8.19, '["08:40:04","12:50:04","13:50:04","17:51:40"]'),
(2,(SELECT DATE('now', '-5 day')), '08:22:53', '17:39:00', 8.27, '["08:22:53","12:39:54","13:39:54","17:39:00"]'),
(2,(SELECT DATE('now', '-4 day')), '06:53:27', '16:03:35', 8.17, '["06:53:27","11:04:47","12:04:47","16:03:35"]'),
(2,(SELECT DATE('now', '-3 day')), '07:47:31', '16:57:42', 8.17, '["07:47:31","11:58:34","12:58:34","16:57:42"]'),
(2,(SELECT DATE('now', '-2 day')), '08:46:06', '17:53:49', 8.13, '["08:46:06","13:05:18","14:05:18","17:53:49"]'),
(2,(SELECT DATE('now', '-1 day')), '08:36:05', '17:59:52', 8.4, '["08:36:05","12:48:09","13:48:09","17:59:52"]'),
(2,(SELECT DATE('now')), '07:32:15', '16:56:55', 8.41, '["07:32:15","11:49:17","12:49:17","16:56:55"]'),

(3,(SELECT DATE('now', '-13 day')), '06:43:48', '16:01:25', 8.29, '["06:43:48","10:58:09","11:58:09","16:01:25"]'),
(3,(SELECT DATE('now', '-12 day')), '08:00:27', '16:58:48', 7.97, '["08:00:27","12:17:13","13:17:13","16:58:48"]'),
(3,(SELECT DATE('now', '-11 day')), '08:00:00', '17:24:42', 8.41, '["08:00:00","12:10:09","13:10:09","17:24:42"]'),
(3,(SELECT DATE('now', '-10 day')), '06:57:36', '16:09:41', 8.2, '["06:57:36","11:14:23","12:14:23","16:09:41"]'),
(3,(SELECT DATE('now', '-9 day')), '08:29:22', '17:33:01', 8.06, '["08:29:22","12:47:21","13:47:21","17:33:01"]'),
(3,(SELECT DATE('now', '-8 day')), '09:21:31', '18:37:48', 8.27, '["09:21:31","13:34:26","14:34:26","18:37:48"]'),
(3,(SELECT DATE('now', '-7 day')), '07:15:37', '16:20:19', 8.08, '["07:15:37","11:34:54","12:34:54","16:20:19"]'),
(3,(SELECT DATE('now', '-6 day')), '09:02:36', '18:04:19', 8.03, '["09:02:36","13:16:36","14:16:36","18:04:19"]'),
(3,(SELECT DATE('now', '-5 day')), '08:47:09', '18:03:19', 8.27, '["08:47:09","12:57:34","13:57:34","18:03:19"]'),
(3,(SELECT DATE('now', '-4 day')), '07:45:22', '17:03:30', 8.3, '["07:45:22","11:55:27","12:55:27","17:03:30"]'),
(3,(SELECT DATE('now', '-3 day')), '08:38:59', '17:52:05', 8.22, '["08:38:59","12:54:14","13:54:14","17:52:05"]'),
(3,(SELECT DATE('now', '-2 day')), '08:21:25', '17:45:10', 8.4, '["08:21:25","12:32:56","13:32:56","17:45:10"]'),
(3,(SELECT DATE('now', '-1 day')), '08:31:57', '17:39:02', 8.12, '["08:31:57","12:44:40","13:44:40","17:39:02"]'),
(3,(SELECT DATE('now')), '09:19:56', '18:37:54', 8.3, '["09:19:56","13:30:09","14:30:09","18:37:54"]'),

(4,(SELECT DATE('now', '-6 day')), '09:13:03', '18:18:45', 8.1, '["09:13:03","13:24:48","14:24:48","18:18:45"]'),
(4,(SELECT DATE('now', '-5 day')), '06:30:34', '15:40:50', 8.17, '["06:30:34","10:45:54","11:45:54","15:40:50"]'),
(4,(SELECT DATE('now', '-4 day')), '07:50:56', '17:13:59', 8.38, '["07:50:56","12:05:20","13:05:20","17:13:59"]'),
(4,(SELECT DATE('now', '-3 day')), '07:40:29', '16:45:49', 8.09, '["07:40:29","11:57:22","12:57:22","16:45:49"]'),
(4,(SELECT DATE('now', '-2 day')), '08:13:11', '17:33:56', 8.35, '["08:13:11","12:25:38","13:25:38","17:33:56"]'),
(4,(SELECT DATE('now', '-1 day')), '09:23:52', '18:31:11', 8.12, '["09:23:52","13:37:13","14:37:13","18:31:11"]'),
(4,(SELECT DATE('now')), '08:50:58', '18:03:39', 8.21, '["08:50:58","13:02:05","14:02:05","18:03:39"]');