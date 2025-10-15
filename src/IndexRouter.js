import React from 'react'
import { BrowserRouter, Route, Routes, redirect, Navigate } from 'react-router-dom'
import Login from '../views/login/Login'
import NewsSandBox from '../views/sandbox/NewsSandBox'
import Detail from '../views/sandbox/news/Detail'
import News from '../views/sandbox/news/News'
/**
 * 基础路由，在App.js中引入
 * 
 */
export default function indexRouter() {
    return (

        <Routes>
            <Route path="/login" element={<Login />} ></Route>
            {/* <Route path="/  " element={<NewsSandBox />} ></Route>
                localStorage.setItem("token","kervin")
                */}
            <Route path="/news" element={<News />}></Route>
            <Route path="/detail/:id" element={<Detail />}></Route>
            <Route path="/*" element={localStorage.getItem("token") ? <NewsSandBox /> : <Login />} />
        </Routes>

    )
}


// export default function IndexRouter() {
//     return (
//         <div>
//             <HashRouter>
//                 <Switch>
//                     <Route
//                         path="/login"
//                         component={Login}
//                     ></Route>

//                     <Route
//                         path="/news"
//                         component={News}
//                     ></Route>
//                     <Route
//                         path="/detail/:id"
//                         component={Detail}
//                     ></Route>
//                     <Route
//                         path="/"
//                         render={() => (localStorage.getItem('token') ? <NewsSandBox /> : <Redirect to="/login" />)}
//                     ></Route>
//                 </Switch>
//             </HashRouter>
//         </div>
//     )
// }
