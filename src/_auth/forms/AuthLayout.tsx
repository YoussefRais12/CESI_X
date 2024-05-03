import { Outlet, Navigate }from 'react-router-dom';

const AuthLayout = () => {
    const isAuthenticated=false;
  return (
    <>
    {isAuthenticated ? (
        <Navigate to="/" />
    ):(
        <div className="flex min-h-screen">
            <section className="flex-1 flex justify-center items-center py-10">
                <Outlet/>
            </section>
            <img src="/assets/images/side-img.svg"
                alt="logo"
                className="hidden xl:block w-1/2 h-screen object-cover bg-no-repeat"/>
        </div>
    )}
    </>
)

}
export default AuthLayout