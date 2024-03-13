import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, users]);

  useEffect(() => {
    paginate();
  }, [filteredUsers]);

  const fetchUsers = async () => {
    try {
      const response = await fetch(
        "https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json"
      );
      const data = await response.json();
      setUsers(data.map((user) => ({ ...user, editable: false })));
      setFilteredUsers(data.map((user) => ({ ...user, editable: false })));
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const filterUsers = () => {
    const filtered = users.filter(
      (user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
    setCurrentPage(1);
  };

  const paginate = () => {
    const pages = Math.ceil(filteredUsers.length / 10);
    if (currentPage > pages) {
      setCurrentPage(pages);
    }
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleCheckboxChange = (userId) => {
    setSelectedRows((prevSelectedRows) => {
      if (prevSelectedRows.includes(userId)) {
        return prevSelectedRows.filter((id) => id !== userId);
      } else {
        return [...prevSelectedRows, userId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedRows.length === filteredUsers.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(filteredUsers.map((user) => user.id));
    }
  };

  const handleDeleteSelected = () => {
    const updatedUsers = filteredUsers.filter(
      (user) => !selectedRows.includes(user.id)
    );
    setUsers(updatedUsers);
    setSelectedRows([]);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleEdit = (userId) => {
    const updatedUsers = users.map((user) => {
      if (user.id === userId) {
        return { ...user, editable: true };
      }
      return user;
    });
    setUsers(updatedUsers);
  };

  const handleSave = (userId) => {
    const updatedUsers = users.map((user) => {
      if (user.id === userId) {
        return { ...user, editable: false };
      }
      return user;
    });
    setUsers(updatedUsers);
  };

  const handleInputChange = (event, userId, fieldName) => {
    const updatedUsers = users.map((user) => {
      if (user.id === userId) {
        return { ...user, [fieldName]: event.target.value };
      }
      return user;
    });
    setUsers(updatedUsers);
  };

  return (
    <div className="app">
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={handleSearch}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch(e);
            }
          }}
        />
        <button className="search-icon">Search</button>
      </div>
      <table>
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                onChange={handleSelectAll}
                checked={
                  selectedRows.length === filteredUsers.length &&
                  selectedRows.length > 0
                }
              />
            </th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers
            .slice((currentPage - 1) * 10, currentPage * 10)
            .map((user) => (
              <tr key={user.id}>
                <td>
                  <input
                    type="checkbox"
                    onChange={() => handleCheckboxChange(user.id)}
                    checked={selectedRows.includes(user.id)}
                  />
                </td>
                <td>
                  {user.editable ? (
                    <input
                      type="text"
                      value={user.name}
                      onChange={(e) => handleInputChange(e, user.id, "name")}
                    />
                  ) : (
                    user.name
                  )}
                </td>
                <td>
                  {user.editable ? (
                    <input
                      type="text"
                      value={user.email}
                      onChange={(e) => handleInputChange(e, user.id, "email")}
                    />
                  ) : (
                    user.email
                  )}
                </td>
                <td>
                  {user.editable ? (
                    <input
                      type="text"
                      value={user.role}
                      onChange={(e) => handleInputChange(e, user.id, "role")}
                    />
                  ) : (
                    user.role
                  )}
                </td>
                <td>
                  {user.editable ? (
                    <button
                      className="save"
                      onClick={() => handleSave(user.id)}
                    >
                      Save
                    </button>
                  ) : (
                    <button
                      className="edit"
                      onClick={() => handleEdit(user.id)}
                    >
                      Edit
                    </button>
                  )}
                  <button
                    className="delete"
                    onClick={() => handleDeleteSelected(user.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
      <div className="pagination">
        <button className="first-page" onClick={() => handlePageChange(1)}>
          First Page
        </button>
        <button
          className="previous-page"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous Page
        </button>
        {[...Array(Math.ceil(filteredUsers.length / 10))].map((_, index) => (
          <button
            key={index}
            className={currentPage === index + 1 ? "active" : ""}
            onClick={() => handlePageChange(index + 1)}
          >
            {index + 1}
          </button>
        ))}
        <button
          className="next-page"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === Math.ceil(filteredUsers.length / 10)}
        >
          Next Page
        </button>
        <button
          className="last-page"
          onClick={() => handlePageChange(Math.ceil(filteredUsers.length / 10))}
        >
          Last Page
        </button>
      </div>
      <button
        className="delete-selected"
        onClick={handleDeleteSelected}
        disabled={selectedRows.length === 0}
      >
        Delete Selected
      </button>
    </div>
  );
}

export default App;
