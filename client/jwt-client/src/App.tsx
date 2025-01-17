import React, {useContext, useEffect, useState} from 'react';
import userService from "../services/user-service.ts";
import LoginForum from "../components/loginForum.tsx";
import {Context} from "./main.tsx";
import {IUser} from "../models/IUser.ts";
import {observer} from "mobx-react-lite";

const App = () => {
    const [users, setUsers]=useState<IUser[]>([])
    const {store}=useContext(Context)

    useEffect(() => {
        if(localStorage.getItem('token')){
            store.checkAuth()
        }
    }, []);

    const getUsers = async()=>{
        try {
            const response=await userService.fetchUsers()
            setUsers(response.data)
        }
        catch (e) {
            console.log(e)
        }
    }

    if (store.isLoading) {
        return <div>Загрузка...</div>;
    }

    if (!store.isAuth) {
        return (
            <div>
                <LoginForum />
                <button onClick={getUsers}>Получить пользователей</button>
            </div>
        );
    }

    console.log(store.user.email)
    return (
        <div>
            <h1>{store.isAuth ? `Пользователь авторизован ${store.user.email}` : 'АВТОРИЗУЙТЕСЬ'}</h1>
            <h1>{store.user.isActivated ? 'Аккаунт подтвержден по почте' : 'ПОДТВЕРДИТЕ АККАУНТ!!!!'}</h1>
            <button onClick={() => store.logout()}>Выйти</button>
            <div>
                <button onClick={getUsers}>Получить пользователей</button>
            </div>
            {users.map(user =>
                <div key={user.email}>{user.email}</div>
            )}
        </div>
    );

};

export default observer(App);