const Login = function()
{
    this.init = function( params )
    {
        //console.warn( "login init" );
        
        let parent = t2.common.getParent( params );
        
        let login = t2.common.el( "div", parent );
            login.textContent = "log in";
    };
    
    this.success = function()
    {
        //console.warn( "login success" );
    };
};

export default Login;