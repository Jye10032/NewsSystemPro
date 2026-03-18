import SideMenu from './SideMenu'
import TopHead from './TopHead'
import NewsRouter from '../router/NewsRouter'
import '@/styles/NewsSandBox.css'
import { useEffect } from 'react'
import { Layout } from 'antd'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { clearAuthToken } from '@/utils/authToken'
import { clearBootstrapCache, fetchBootstrapUser, fetchRightsTree, getCachedBootstrapUser } from '@/utils/bootstrapCache'
const { Content } = Layout

export default function NewsSandBox() {
    const dispatch = useDispatch()
    const navigate = useNavigate()

    useEffect(() => {
        const cachedUser = getCachedBootstrapUser()
        if (cachedUser) {
            dispatch({ type: 'set_user', payload: cachedUser })
        }

        Promise.all([fetchBootstrapUser(), fetchRightsTree()])
            .then(([user]) => {
                dispatch({ type: 'set_user', payload: user })
            })
            .catch(() => {
                clearAuthToken()
                clearBootstrapCache()
                dispatch({ type: 'clear_user' })
                navigate('/login', { replace: true })
            })
    }, [dispatch, navigate])

    return (
        <Layout>
            <SideMenu></SideMenu>
            <Layout className="site-layout">
                <TopHead></TopHead>
                <Content>
                    <NewsRouter></NewsRouter>
                </Content>
            </Layout>
        </Layout>
    )
}
