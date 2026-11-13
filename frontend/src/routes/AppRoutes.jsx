
import { Navigate, Route, Routes } from 'react-router-dom';

import Login from '../pages/auth/Login';
import Dashboard from '../pages/dashboard/Dashboard';
import Productos from '../pages/productos/Productos';
import Inventario from '../pages/inventario/Inventario';
import Ventas from '../pages/ventas/Ventas';
import Usuarios from '../pages/usuarios/Usuarios';

import PrivateRoute from './PrivateRoute';
import MainLayout from '../layouts/MainLayout';

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />

            <Route
                path="/dashboard"
                element={
                    <PrivateRoute>
                        <MainLayout>
                            <Dashboard />
                        </MainLayout>
                    </PrivateRoute>
                }
            />

            <Route
                path="/productos"
                element={
                    <PrivateRoute>
                        <MainLayout>
                            <Productos />
                        </MainLayout>
                    </PrivateRoute>
                }
            />

            <Route
                path="/inventario"
                element={
                    <PrivateRoute>
                        <MainLayout>
                            <Inventario />
                        </MainLayout>
                    </PrivateRoute>
                }
            />


            <Route
                path="/ventas"
                element={
                    <PrivateRoute>
                        <MainLayout>
                            <Ventas />
                        </MainLayout>
                    </PrivateRoute>
                }
            />

            <Route
                path="/usuarios"
                element={
                    <PrivateRoute rolPermitido="administrador">
                        <MainLayout>
                            <Usuarios />
                        </MainLayout>
                    </PrivateRoute>
                }
            />


            <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    );
};

export default AppRoutes;
