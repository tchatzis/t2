const Template = function( module )
{
    this.init = async () => 
    {
        await t2.navigation.update( 
        [ 
            { id: "content", functions: [ { clear: null } ] },
        ] );
    };
};

export default Template;