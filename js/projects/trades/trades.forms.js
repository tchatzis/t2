const Forms =  function( module )
{
    let el = t2.common.el;

    this.create = function( params )
    {
        let list = this;
        let id = params.name + 0;

        let form = el( "form", params.parent );
            form.id = id;
            form.addEventListener( "submit", ( e ) => module.handlers.create.call( list, e, params ) );

        for ( let key in params.item )
            format( key );
        
        let cell = el( "div", params.parent );
            cell.style.padding = 0;
        
        let input = el( "input", cell );
            input.setAttribute( "form", id );
            input.type = "submit";
            input.value = "add";

        function format( key )
        {
            let display = false;
            let content = params.item[ key ];
            let css;
            let size;
            let step;
            let type;

            switch( key )
            {
                case "brokerage":
                    display = true;
                    css = key;
                    size = 8;
                    type = "text";
                    break;

                case "symbol":
                    display = true;
                    size = 4;
                    type = "text";
                    break;

                case "action":
                    display = true;
                    css = params.name.toLowerCase();
                    size = 3;
                    type = "text";
                    break;

                case "notes":
                    display = true;
                    css = key.toLowerCase();
                    size = 3;
                    type = "text";
                    break;

                case "qty":
                    display = true;
                    css = "info";
                    size = 3;
                    step = 1;
                    type = "number";
                    break;

                case "price":
                    display = true;
                    size = 4;
                    step = 0.01;
                    type = "text";
                    break;

                case "value":
                    display = false;
                    size = 6;
                    type = "number";
                    break;    
            }

            if ( display )
            {   
                let cell = el( "div", params.parent );
                    cell.classList.add( "data" );
                    cell.style.padding = 0;
                    
                if ( css )
                    cell.classList.add( css );
                
                let input = el( "input", cell );
                    input.setAttribute( "form", id );
                    input.name = key;
                    input.placeholder = key;
                    input.style.width = size + "em";
                    input.type = type;
                    input.value = content;
                if ( step )
                    input.step = step;

                return cell;
            }  
        }
        
        return params.parent;
    };
    
    this.read = function( params )
    {
        for ( let key in params.item )
            format( key );

        function format( key )
        {
            let display = false;
            let content = params.item[ key ];
            let css;
            let size;
            let type;

            switch( key )
            {
                case "brokerage":
                    display = false;
                    css = key;
                    break;

                case "symbol":
                    display = !module.actions.indexOf( params.name );
                    break;

                case "action":
                    display = true;
                    css = params.name.toLowerCase();
                    break;

                case "notes":
                    display = true;
                    css = params.name.toLowerCase();
                    size = 3;
                    type = "text";
                    break;

                case "qty":
                    display = true;
                    css = "info";
                    break;

                case "price":
                    display = true;
                    content = content.toFixed( 2 );
                    break;

                case "value":
                    display = true;
                    content = content.toFixed( 2 );
                    break;  
                    
                case "date":
                    display = true;
                    css = key;
                    break;
            }
            
            if ( display )
            {   
                let cell = el( "div", params.parent );
                    cell.classList.add( "data" );
                    cell.textContent = content;
                if ( css )
                    cell.classList.add( css );

                return cell;
            }  
        }
    };
    
    this.edit = function( params )
    {
        let list = this;
        let id = params.name + params.item.id;

        params.parent.innerHTML = null;

        let form = el( "form", params.parent );
            form.id = id;
            form.addEventListener( "submit", ( e ) => module.handlers.update.call( list, e, params ) );

        for ( let key in params.item )
            format( key );
        
        let cell = el( "div", params.parent );
            cell.style.padding = 0;
        
        let input = el( "input", cell );
            input.setAttribute( "form", id );
            input.type = "submit";
            input.value = "update";

        function format( key )
        {
            let display = false;
            let content = params.item[ key ];
            let css;
            let size;
            let step;
            let type;

            switch( key )
            {
                case "brokerage":
                    display = true;
                    css = key;
                    size = 8;
                    type = "text";
                    break;

                case "symbol":
                    display = true;
                    size = 4;
                    type = "text";
                    break;

                case "action":
                    display = true;
                    css = params.name.toLowerCase();
                    size = 3;
                    type = "text";
                    break;

                case "notes":
                    display = true;
                    css = key.toLowerCase();
                    size = 3;
                    type = "text";
                    break;

                case "qty":
                    display = true;
                    css = "info";
                    size = 3;
                    step = 1;
                    type = "number";
                    break;

                case "price":
                    display = true;
                    content = content.toFixed( 2 );
                    size = 4;
                    step = 0.01;
                    type = "text";
                    break;

                case "value":
                    display = true;
                    content = content.toFixed( 2 );
                    size = 6;
                    step = 0.01;
                    type = "number";
                    break;    
                    
                case "date":
                    display = true;
                    size = 6;
                    break;
            }

            if ( display )
            {   
                let cell = el( "div", params.parent );
                    cell.classList.add( "edit" );
                    
                if ( css )
                    cell.classList.add( css );
                
                let input = el( "input", cell );
                    input.setAttribute( "form", id );
                    input.name = key;
                    input.placeholder = key;
                    input.style.width = size + "em";
                    input.type = type;
                    input.value = content;
                if ( step )
                    input.step = step;

                return cell;
            }  
        }
    };
};

export default Forms;