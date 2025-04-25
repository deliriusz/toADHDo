export const getUser = async (locals: App.Locals) => {
  const {
    data: { user },
  } = await locals.supabase.auth.getUser();
  return user;
};
