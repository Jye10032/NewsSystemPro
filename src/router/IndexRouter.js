import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Login from '../login/Login'
import NewsSandBox from '../sandbox/NewsSandBox'
import Detail from '../sandbox/news/Detail'
import News from '../sandbox/news/News'
/**
 * 基础路由，在App.js中引入
 * 
 */
export default function IndexRouter() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            {/* <Route path="/  " element={<NewsSandBox />} />
                    localStorage.setItem("token","kervin")
            */}
            <Route path="/news" element={<News />} />
            <Route path="/detail/:id" element={<Detail />} />
            <Route path="/*" element={localStorage.getItem('token') ? <NewsSandBox /> : <Login />} />
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
