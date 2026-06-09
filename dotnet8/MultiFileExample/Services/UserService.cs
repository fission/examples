using System;
using System.Collections.Generic;
using System.Linq;
using MultiFileExample.Models;

namespace MultiFileExample.Services
{
    public class UserService
    {
        private readonly List<User> _users;

        public UserService()
        {
            // Initialize with sample data
            _users = new List<User>
            {
                new User { Id = 1, Name = "Alice Johnson", Email = "alice@example.com", IsActive = true, CreatedAt = DateTime.UtcNow.AddDays(-30) },
                new User { Id = 2, Name = "Bob Smith", Email = "bob@example.com", IsActive = true, CreatedAt = DateTime.UtcNow.AddDays(-25) },
                new User { Id = 3, Name = "Charlie Brown", Email = "charlie@example.com", IsActive = false, CreatedAt = DateTime.UtcNow.AddDays(-20) },
                new User { Id = 4, Name = "Diana Prince", Email = "diana@example.com", IsActive = true, CreatedAt = DateTime.UtcNow.AddDays(-15) },
                new User { Id = 5, Name = "Edward Norton", Email = "edward@example.com", IsActive = false, CreatedAt = DateTime.UtcNow.AddDays(-10) }
            };
        }

        public UserListResponse GetAllUsers()
        {
            return new UserListResponse
            {
                Users = _users,
                Total = _users.Count,
                Timestamp = DateTime.UtcNow,
                Source = "UserService.cs"
            };
        }

        public UserListResponse GetActiveUsers()
        {
            var activeUsers = _users.Where(u => u.IsActive).ToList();
            
            return new UserListResponse
            {
                Users = activeUsers,
                Total = activeUsers.Count,
                FilteredBy = "IsActive = true",
                Timestamp = DateTime.UtcNow,
                Source = "UserService.cs"
            };
        }

        public User GetUserById(int id)
        {
            return _users.FirstOrDefault(u => u.Id == id);
        }

        public bool AddUser(User user)
        {
            if (user == null || _users.Any(u => u.Id == user.Id))
                return false;

            user.CreatedAt = DateTime.UtcNow;
            _users.Add(user);
            return true;
        }
    }
}