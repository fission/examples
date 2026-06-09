using System;
using System.Collections.Generic;

namespace MultiFileExample.Models
{
    public class User
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class UserListResponse
    {
        public List<User> Users { get; set; }
        public int Total { get; set; }
        public string FilteredBy { get; set; }
        public DateTime Timestamp { get; set; }
        public string Source { get; set; }
    }
}