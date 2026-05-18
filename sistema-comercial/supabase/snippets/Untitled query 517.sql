INSERT INTO public.profiles (id, full_name, role)
SELECT id, email, 'admin' 
FROM auth.users 
WHERE email = 'mosiahassuncao@gmail.com' -- Submeta o seu e-mail aqui
ON CONFLICT (id) DO UPDATE 
SET role = 'admin';