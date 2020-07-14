// PLEASE IMPLEMENT
export const permissionPolicy = {
  users: {
    $condition: (data: any, context: any) => {
      return (context && data && context['https://myapp.example.com/user_metadata']['userId'] === data.users.user_id)
    }
  }
};
