-- 1. Inserir um novo registro na tabela account
INSERT INTO public.account (account_firstname, account_lastname, account_email, account_password)
VALUES ('Tony', 'Stark', 'tony@starkent.com', 'Iam1ronM@n');

-- 2. Modificar o tipo de conta de Tony Stark para "Admin"
UPDATE public.account
SET account_type = 'Admin'
WHERE account_email = 'tony@starkent.com';

-- 3. Excluir o registro de Tony Stark do banco de dados
DELETE FROM public.account
WHERE account_email = 'tony@starkent.com';

-- 4. Modificar a descrição do "GM Hummer" para corrigir "small interiors" para "a huge interior"
UPDATE public.inventory
SET inv_description = REPLACE(inv_description, 'small interiors', 'a huge interior')
WHERE inv_make = 'GM' AND inv_model = 'Hummer';

-- 5. Selecionar os campos make, model e classification_name dos veículos da categoria "Sport"
SELECT i.inv_make, i.inv_model, c.classification_name
FROM public.inventory i
INNER JOIN public.classification c ON i.classification_id = c.classification_id
WHERE c.classification_name = 'Sport';

-- 6. Atualizar os caminhos das imagens para incluir "/vehicles"
UPDATE public.inventory
SET inv_image = REPLACE(inv_image, '/images/', '/images/vehicles/'),
    inv_thumbnail = REPLACE(inv_thumbnail, '/images/', '/images/vehicles/');
