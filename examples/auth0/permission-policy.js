exports.permissionPolicy = {
  users: {
    $condition: (data, context) => (context && data && context["https://myapp.example.com/user_metadata"]["userId"] === data.users.user_id)
  }
};
