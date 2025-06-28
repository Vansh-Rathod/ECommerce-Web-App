import {
    createContext,
    useContext,
    useState,
    ReactNode
  } from "react";
  import api from "../services/api";
  
  interface UserContextType {
    users: any;
    setUsers: (users: any) => void;
    getUsers: (
      pageNumber: number,
      pageSize: number,
      searchText: string,
      sortField: string,
      sortOrder: string
    ) => void;
    totalUsers: any;
    setTotalUsers: any;
  }
  
  const UserContext = createContext<UserContextType | undefined>(
    undefined
  );
  
  export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [users, setUsers] = useState<any>();
    const [totalUsers, setTotalUsers] = useState<any>();

  
    const getUsers = async (
      pageNumber = 1,
      pageSize = 10,
      searchText: string,
      sortField: string,
      sortOrder: string
    ) => {
      try {
        const response = await api.get("/user/users", {
          params: {
            pageNumber,
            pageSize,
            searchText,
            sortField,
            sortOrder,
          },
        });
  
        if (response.data.status === 200) {
          const usersResponse = response.data.data.users;
          const totalUsersResponse = response.data.data.totalUsers;
          setUsers(usersResponse);
          setTotalUsers(totalUsersResponse);
        } else {
          console.log("Users not found");
        }
  
        return true;
      } catch (error) {
        console.error("Failed to fetch users:", error);
        return false;
      }
    };
  
    return (
      <UserContext.Provider
        value={{
          users,
          setUsers,
          getUsers,
          totalUsers,
          setTotalUsers
        }}
      >
        {children}
      </UserContext.Provider>
    );
  };
  
  export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
      throw new Error("useUser must be used within an UserProvider");
    }
    return context;
  };
  