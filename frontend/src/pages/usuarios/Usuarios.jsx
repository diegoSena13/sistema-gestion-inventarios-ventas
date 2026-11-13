
import { useEffect, useState } from 'react';
import {
    listarUsuarios,
    crearUsuario,
    desactivarUsuario
} from '../../services/usuariosService';
import './Usuarios.css';

function Usuarios() {
    const [usuarios, setUsuarios] = useState([]);

    const [formulario, setFormulario] = useState({
        nombre: '',
        correo: '',
        password: '',
        rol: 'usuario'
    });

    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [desactivando, setDesactivando] = useState(null);

    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [busqueda, setBusqueda] = useState('');

    const [error, setError] = useState('');
    const [mensaje, setMensaje] = useState('');

    useEffect(() => {
        cargarUsuarios();
    }, []);

    const cargarUsuarios = async () => {
        try {
            setCargando(true);
            setError('');

            const respuesta = await listarUsuarios();
            setUsuarios(respuesta.usuarios || []);

        } catch (err) {
            setError(
                err.response?.data?.message ||
                'No fue posible cargar los usuarios'
            );
        } finally {
            setCargando(false);
        }
    };

    const manejarCambio = (e) => {
        const { name, value } = e.target;

        setFormulario({
            ...formulario,
            [name]: value
        });
    };

    const registrarUsuario = async (e) => {
        e.preventDefault();

        try {
            setGuardando(true);
            setError('');
            setMensaje('');

            const respuesta = await crearUsuario(formulario);

            setMensaje(
                respuesta.message || 'Usuario registrado correctamente'
            );

            setFormulario({
                nombre: '',
                correo: '',
                password: '',
                rol: 'usuario'
            });

            setMostrarFormulario(false);

            await cargarUsuarios();

        } catch (err) {
            setError(
                err.response?.data?.message ||
                'No fue posible registrar el usuario'
            );
        } finally {
            setGuardando(false);
        }
    };

    const manejarDesactivacion = async (id, nombre) => {
        const confirmar = window.confirm(
            `¿Estás seguro de desactivar al usuario ${nombre}?`
        );

        if (!confirmar) return;

        try {
            setDesactivando(id);
            setError('');
            setMensaje('');

            const respuesta = await desactivarUsuario(id);

            setMensaje(
                respuesta.message || 'Usuario desactivado correctamente'
            );

            await cargarUsuarios();

        } catch (err) {
            setError(
                err.response?.data?.message ||
                'No fue posible desactivar el usuario'
            );
        } finally {
            setDesactivando(null);
        }
    };

    const usuariosFiltrados = usuarios.filter(usuario => {
        const termino = busqueda.toLowerCase();

        return (
            usuario.nombre.toLowerCase().includes(termino) ||
            usuario.correo.toLowerCase().includes(termino)
        );
    });

    if (cargando) {
        return (
            <div className="usuarios-container">
                Cargando usuarios...
            </div>
        );
    }

    return (
        <div className="usuarios-container">
            <div className="usuarios-content">

                <div className="usuarios-header">
                    <div>
                        <h2>Administración de usuarios</h2>
                        <p>
                            Gestiona las cuentas y los permisos de acceso
                            al sistema.
                        </p>
                    </div>

                    <button
                        className="btn btn-success"
                        onClick={() => {
                            setMostrarFormulario(!mostrarFormulario);
                            setError('');
                            setMensaje('');
                        }}
                    >
                        <i className="bi bi-person-plus"></i>
                        {' '}Agregar usuario
                    </button>
                </div>

                {error && (
                    <div className="alert alert-danger">
                        {error}
                    </div>
                )}

                {mensaje && (
                    <div className="alert alert-success">
                        {mensaje}
                    </div>
                )}

                {mostrarFormulario && (
                    <section className="usuarios-panel">
                        <h4>Registrar nuevo usuario</h4>

                        <form onSubmit={registrarUsuario}>
                            <div className="usuarios-form-grid">

                                <div>
                                    <label className="form-label">
                                        Nombre completo
                                    </label>

                                    <input
                                        type="text"
                                        name="nombre"
                                        className="form-control"
                                        placeholder="Nombre del usuario"
                                        value={formulario.nombre}
                                        onChange={manejarCambio}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="form-label">
                                        Correo electrónico
                                    </label>

                                    <input
                                        type="email"
                                        name="correo"
                                        className="form-control"
                                        placeholder="correo@ejemplo.com"
                                        value={formulario.correo}
                                        onChange={manejarCambio}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="form-label">
                                        Contraseña
                                    </label>

                                    <input
                                        type="password"
                                        name="password"
                                        className="form-control"
                                        placeholder="Mínimo 8 caracteres"
                                        value={formulario.password}
                                        onChange={manejarCambio}
                                        minLength="8"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="form-label">
                                        Rol del usuario
                                    </label>

                                    <select
                                        name="rol"
                                        className="form-select"
                                        value={formulario.rol}
                                        onChange={manejarCambio}
                                        required
                                    >
                                        <option value="usuario">
                                            Usuario
                                        </option>

                                        <option value="administrador">
                                            Administrador
                                        </option>
                                    </select>
                                </div>

                            </div>

                            <div className="usuarios-form-actions">
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    onClick={() => setMostrarFormulario(false)}
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="submit"
                                    className="btn btn-success"
                                    disabled={guardando}
                                >
                                    {guardando
                                        ? 'Registrando...'
                                        : 'Guardar usuario'}
                                </button>
                            </div>
                        </form>
                    </section>
                )}

                <section className="usuarios-panel">
                    <div className="usuarios-list-header">
                        <h4>Usuarios registrados</h4>

                        <input
                            type="text"
                            className="form-control usuarios-busqueda"
                            placeholder="Buscar usuario..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                        />
                    </div>

                    <div className="usuarios-resumen">
                        <div className="usuario-resumen-card">
                            <span>Total de usuarios</span>
                            <strong>{usuarios.length}</strong>
                        </div>

                        <div className="usuario-resumen-card">
                            <span>Usuarios activos</span>
                            <strong>
                                {usuarios.filter(u => u.activo).length}
                            </strong>
                        </div>

                        <div className="usuario-resumen-card">
                            <span>Administradores</span>
                            <strong>
                                {usuarios.filter(
                                    u => u.rol === 'administrador' && u.activo
                                ).length}
                            </strong>
                        </div>
                    </div>

                    <div className="table-responsive">
                        <table className="table table-hover align-middle">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Nombre</th>
                                    <th>Correo</th>
                                    <th>Rol</th>
                                    <th>Estado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>

                            <tbody>
                                {usuariosFiltrados.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="text-center">
                                            No se encontraron usuarios.
                                        </td>
                                    </tr>
                                ) : (
                                    usuariosFiltrados.map(usuario => (
                                        <tr key={usuario.id_usuario}>
                                            <td>{usuario.id_usuario}</td>

                                            <td>{usuario.nombre}</td>

                                            <td>{usuario.correo}</td>

                                            <td>
                                                <span className={
                                                    usuario.rol === 'administrador'
                                                        ? 'usuario-rol admin'
                                                        : 'usuario-rol normal'
                                                }>
                                                    {usuario.rol}
                                                </span>
                                            </td>

                                            <td>
                                                <span className={
                                                    usuario.activo
                                                        ? 'usuario-estado activo'
                                                        : 'usuario-estado inactivo'
                                                }>
                                                    {usuario.activo
                                                        ? 'Activo'
                                                        : 'Inactivo'}
                                                </span>
                                            </td>

                                            <td>
                                                {usuario.activo ? (
                                                    <button
                                                        className="btn btn-outline-danger btn-sm"
                                                        disabled={
                                                            desactivando === usuario.id_usuario
                                                        }
                                                        onClick={() =>
                                                            manejarDesactivacion(
                                                                usuario.id_usuario,
                                                                usuario.nombre
                                                            )
                                                        }
                                                    >
                                                        <i className="bi bi-person-x"></i>
                                                        {' '}
                                                        {desactivando === usuario.id_usuario
                                                            ? 'Desactivando...'
                                                            : 'Desactivar'}
                                                    </button>
                                                ) : (
                                                    <span className="text-muted">
                                                        Sin acciones
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

            </div>
        </div>
    );
}

export default Usuarios;
