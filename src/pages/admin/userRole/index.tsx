import AppShell from "@/components/shared/AppShell";
import withAdminAuth from "@/components/withAdminAuth"; // Import the HOC for admin authentication
import { useState, useEffect } from "react"; // Import useEffect
import { Button } from "@/components/ui/button"; // Import Button component
import { Input } from "@/components/ui/input"; // Import Input component
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Import Select components
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"; // Import Table components

// Define a type for user data including custom claims
interface UserData {
  uid: string;
  email: string | null;
  isAdmin: boolean;
  isModerator: boolean;
}

interface SetUserRoleProps {
  // initialUsers prop is no longer needed as we fetch client-side
}

// Update the component signature as it no longer receives initialUsers from props
const SetUserRole: React.FC<SetUserRoleProps> = () => {
  const [users, setUsers] = useState<UserData[]>([]); // Initialize with empty array
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("user");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(""); // State for search term
  const [usersLoading, setUsersLoading] = useState(true); // New state for loading users

  // Function to fetch users from the new API endpoint
  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const response = await fetch("/api/getUsersWithRoles"); // Call the new API endpoint
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      const data = await response.json();
      setUsers(data.users);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to load users. Please try again.");
      setUsers([]);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(); // Fetch users when the component mounts
  }, []); // Empty dependency array means this runs once on mount

  // Filtered users based on search term
  const filteredUsers = users.filter(user =>
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSetRole = async (targetEmail: string, targetRole: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/setUserRole", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: targetEmail, role: targetRole }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to set user role');
      }

      alert("Role updated successfully");
      await fetchUsers(); // Re-fetch users after successful role update

      setEmail("");
      setRole("user");
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
      alert(error instanceof Error ? error.message : 'Error updating role');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell active="Add admin">
      <div className="p-6 max-w-4xl mx-auto bg-white text-black rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Manage User Roles</h1>

        {/* Search Input */}
        <div className="mb-6">
          <Input
            type="text"
            placeholder="Search by email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {error && <div className="text-red-500 mb-4 text-center">{error}</div>}

        <div className="overflow-x-auto">
          {usersLoading ? (
            <div className="text-center text-gray-500 py-10">Loading users...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Email</TableHead>
                  <TableHead>Current Role</TableHead>
                  <TableHead className="w-[150px]">Set New Role</TableHead>
                  <TableHead className="w-[100px]">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <TableRow key={user.uid}>
                      <TableCell className="font-medium text-gray-700">{user.email}</TableCell>
                      <TableCell>
                        {user.isAdmin ? "Admin" : user.isModerator ? "Moderator" : "User"}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={user.isAdmin ? "admin" : user.isModerator ? "moderator" : "user"}
                          onValueChange={(value) => setRole(value)} // This will update the 'role' state for the form, not directly set the user's role. We need to pass the selected role to handleSetRole.
                        >
                          <SelectTrigger className="w-full text-black border-gray-300">
                            <SelectValue placeholder="Select Role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="moderator">Moderator</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Button
                          onClick={() => handleSetRole(user.email || '', role)} // Pass the user's email and currently selected role
                          disabled={loading}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm disabled:opacity-50"
                        >
                          {loading ? 'Updating...' : 'Update'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-gray-500">
                      No users found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Existing form for quick individual role setting (optional, can be removed if table is sufficient) */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Set Role for New User (or quickly for existing)</h2>
          <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 items-center">
            <Input
              className="flex-1 text-black p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="email"
              placeholder="Enter user email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            <Select
              value={role}
              onValueChange={setRole}
              disabled={loading}
            >
              <SelectTrigger className="w-[180px] text-black border-gray-300">
                <SelectValue placeholder="Select Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="moderator">Moderator</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={() => handleSetRole(email, role)} // Use the email and role from the form states
              disabled={loading || !email}
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-md disabled:opacity-50"
            >
              {loading ? 'Setting...' : 'Set Role'}
            </Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default withAdminAuth(SetUserRole);