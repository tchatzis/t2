const Template = function( module )
{
    this.init = async () => 
    {
        await t2.navigation.update( 
        [ 
            { id: "content", functions: [ { clear: null }, { invoke: [ { f: scoresheet, args: null } ] } ] },
        ] );
    };
    
    const scoresheet = async () => 
    {
        const round = document.createElement( "th" );
            round.innerText = "round";
        const thead = document.createElement( "tr" );
            thead.appendChild( round );
        const total = document.createElement( "th" );
            total.innerText = "total";
        const tfoot = document.createElement( "tr" );
            tfoot.appendChild( total );
        const table = document.createElement( "table" );
            table.addEventListener( "contextmenu", ( e ) => e.preventDefault() );
            table.appendChild( thead );
        const log = document.createElement( "div" );
            log.classList.add( "date" );
            log.classList.add( "p10" );
        const parent = t2.ui.children.get( "content" );
            parent.element.appendChild( table );
            parent.element.appendChild( log );

        let done = false;
        const count = 9;
        const players = new Map();
        const rounds  = new Map();
        
        const Player = function()
        {
            this.score = 0;
            this.previous = 0;
            this.rounds = new Map();
            this.active = false;

            let tally;

            this.add = ( name ) =>
            {
                if ( !name )
                    return;
                
                if ( this.active )
                    rename( name );
                else
                    activate( name );
            };

            this.commit = () =>
            {
                this.previous = this.score;
            };

            this.update = ( score ) => 
            {
                this.score = this.previous + score.subtotal();
                tally.innerText = this.score;
            };
            
            const activate = ( name ) =>
            {
                this.active = true;
                this.name = name;

                if ( !players.get( this.name ) )
                {
                    elements();

                    this.element.innerText = this.name;
                }

                players.set( this.name, this );
            };
            
            const remove = () => 
            {
                this.active = false;
                this.element.remove();

                players.delete( this.name );
            };

            const elements = () =>
            {
                this.element = document.createElement( "th" );
                this.element.classList.add( "function" );
                thead.appendChild( this.element );
    
                tally = document.createElement( "th" );
                tally.classList.add( "oversize" );
                tally.classList.add( "right" );
                tfoot.appendChild( tally );
            };
            
            const rename = ( name ) =>
            {
                remove();
                activate( name );
            };
        };
        
        const Round = function( args )
        {
            this.round = args.round + 1;
            this.cards = args.round + 3;

            const flagged = new Set();

            const round = document.createElement( "td" );
                round.innerText = this.round;
                round.classList.add( "cell" );

            this.element = document.createElement( "tr" );
            this.element.addEventListener( "contextmenu", ( e ) => this.unlock( e ) );
            this.element.appendChild( round );

            Report.call( this );

            if ( args.round )
                this.element.classList.add( "disabled" );

            table.appendChild( this.element );
            
            players.forEach( player =>
            {
                const score = new Score();

                Cell.call( score, this, player );
                
                player.rounds.set( this.cards, score );
                
                this.element.appendChild( score.element );
            } );

            const next = document.createElement( "td" );
                next.innerText = "Next"; 
                next.classList.add( "button" );
                next.addEventListener( "click", () => this.next() );

            this.element.appendChild( next );

            this.disable = () => next.classList.add( "disabled" );

            this.enable = () => next.classList.remove( "disabled" );

            this.flag = ( player, score ) =>
            {
                // flag player score update
                flagged.add( player );
                score.element.classList.add( "highlight" );

                if ( flagged.size == players.size )
                    this.enable();
                else
                    this.disable();    
            };

            this.next = () =>
            {
                if ( this.round < count )
                {
                    this.report( { message: `---------- end of round ${ this.round } ----------`, css: "sell", type: "round" } ); 
                    
                    this.element.classList.add( "disabled" );

                    let round = rounds.get( this.round + 1 );
                        round?.element.classList.remove( "disabled" );
                }
                else
                    over.call( this ); 

                players.forEach( player => 
                {
                    const score = player.rounds.get( this.cards );
                        score.element.classList.remove( "highlight" );
                    player.commit();
                } );
            };

            this.unlock = ( e ) =>
            {
                e.preventDefault();

                this.report( { message: `---------- round ${ this.round } unlocked----------`, css: "div", type: "edit" } );

                players.forEach( player => 
                {
                    player.rounds.forEach( ( score, round ) => 
                    {
                        if ( this.cards == round )
                        {
                            let deduction = score.subtotal();
                            
                            player.previous = player.score - deduction;

                            this.report( { message: `${ player.name } deducted ${ deduction }`, css: "object", type: player.name } );
                        }
                    } );
                } );

                this.element.classList.remove( "disabled" );
                this.enable();
            };

            this.disable();

            const over = () =>
            {
                const scores = [];

                players.forEach( player => scores.push( { name: player.name, score: player.score } ) );

                scores.sort( ( a, b ) => b.score - a.score );

                this.report( { message: `---------- game over ----------`, css: "sell", type: "end" } ); 

                scores.forEach( score => this.report( { message: `${ score.name }: ${ score.score }`, type: score.name } ) );
            };
        };
        
        const Score = function()
        {
            this.card_total = 0;
            this.most_words = 0;
            this.longest_word = 0;

            this.output = () => this.st.innerText = this.subtotal();
            this.subtotal = () => this.card_total;
            
            this.element = document.createElement( "td" );
            this.element.classList.add( "cell" );
            this.element.classList.add( "field" );
        };

        const Cell = function( round, player )
        {   
            // clear
            this.element.innerHTML = null;
            this.element.style.padding = 0;

            let ct = document.createElement( "input" );
                ct.setAttribute( "name", "card_total" );
                ct.setAttribute( "step", 1 );
                ct.setAttribute( "type", "number" );
                ct.setAttribute( "value", this.card_total );
                ct.addEventListener( "focus", () => round.flag( player, this ) );
                ct.addEventListener( "input", () => 
                {
                    this.card_total = Number( ct.value );
                    this.refresh();
                } );
                ct.title = "card total";

            this.element.appendChild( ct );

            // subtotal element
            this.st = document.createElement( "span" );
            this.st.classList.add( "oversize" );
            this.output();

            this.refresh = () =>
            {
                this.output();
                round.flag( player, this );
                player.update( this );
            };
        };

        const Report = function()
        {
            this.report = ( report ) =>
            {
                this.omit( report.type );
                
                const item = document.createElement( "div" );
                    item.innerText = report.message;
                    item.setAttribute( "data-round", this.round );
                    item.setAttribute( "data-type", report.type );
                if ( report.css )
                    item.classList.add( report.css );
                
                log.appendChild( item );

                return true;
            };

            this.omit = ( type ) => 
            {
                let logs = log.querySelectorAll( `[ data-round = "${ this.round }" ][ data-type = "${ type }" ]` );

                Array.from( logs ).forEach( node => node.remove() );
            };
        };

        const init = () =>
        {
            let name = window.prompt( "Player name: " );
            let player = new Player();
                player.add( name );
            let another = window.confirm( "Add another player?" );

            done = !another;
            
            if ( another )
                init();
            else
                set();
        };
              
        const set = () =>
        {
            if ( !done )
                return;
            
            for ( let round = 0; round < count; round++ )
            {
                rounds.set( round + 1, new Round( { round: round } ) );
            }

            table.appendChild( tfoot );
        };

        init();
    };
};

export default Template;