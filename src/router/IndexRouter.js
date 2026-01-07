import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Login from '../modules/login/Login'
import NewsSandBox from '../sandbox/NewsSandBox'
import Detail from '../modules/visitor/pages/Detail'
import News from '../modules/visitor/pages/News'
import AuthRoute from './AuthRoute'

/**
 * 基础路由，在App.js中引入
 *
 */
export default function IndexRouter() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/news" element={<News />} />
            <Route path="/detail/:id" element={<Detail />} />
            <Route path="/*" element={
                <AuthRoute>
                    <NewsSandBox />
                </AuthRoute>
            } />
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
