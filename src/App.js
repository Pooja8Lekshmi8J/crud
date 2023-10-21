import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import UsersTable from "./components/UsersTable";
import AddUserForm from "./components/AddUserForm";
import EditUserForm from "./components/EditUserForm";
import Pagination from "./components/Pagination";
import Modal from "./components/Modal";
import useModal from "./hooks/useModal";
import axios from "axios";

const App = () => {
  const [users, setUsers] = useState([]);
  const [editing, setEditing] = useState(false);
  const initialFormState = {
    id: null,
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    image: "",
  };
  const [currentUser, setCurrentUser] = useState(initialFormState);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const { isShowing, toggle } = useModal();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`https://reqres.in/api/users`, {
          params: {
            page: currentPage,
            per_page: usersPerPage,
          },
        });

        const res = response.data;

        const formattedUsers = res.data.map((user) => ({
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          image: user.avatar,
        }));

        setUsers(formattedUsers);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [currentPage, usersPerPage]);

  const addUser = (user) => {
    toggle();
    user.id = users.length + 1;
    user.image = "https://randomuser.me/api/portraits/thumb/lego/1.jpg";
    setUsers([user, ...users]);
  };

  const editUser = (user) => {
    setEditing(true);
    toggle();
    setCurrentUser({
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      username: user.username,
      email: user.email,
      image: user.image,
    });
  };

  const updateUser = (id, updatedUser) => {
    setEditing(false);
    setUsers(users.map((user) => (user.id === id ? updatedUser : user)));
    toggle();
  };

  const deleteUser = (id) => {
    setUsers(users.filter((user) => user.id !== id));
  };

  // pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
  // change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <>
      <Header />
      <div className="container">
        <button className="button-add" onClick={toggle}>
          Add User
        </button>
      </div>
      {editing ? (
        <Modal
          isShowing={isShowing}
          hide={toggle}
          content={
            <EditUserForm
              setEditing={setEditing}
              currentUser={currentUser}
              updateUser={updateUser}
            />
          }
        />
      ) : (
        <Modal
          isShowing={isShowing}
          hide={toggle}
          content={<AddUserForm addUser={addUser} />}
        />
      )}
      <UsersTable
        users={currentUsers}
        editUser={editUser}
        deleteUser={deleteUser}
      />
      <Pagination
        usersPerPage={usersPerPage}
        totalUsers={users.length}
        paginate={paginate}
      />
    </>
  );
};

export default App;
