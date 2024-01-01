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
        const cards = document.createElement( "th" );
            cards.innerText = "cards"; 
        const thead = document.createElement( "tr" );
            thead.appendChild( round );
            thead.appendChild( cards );
        const total = document.createElement( "th" );
            total.setAttribute( "colspan", 2 );
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
        const count = 8;
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
            const bonuses = [ "most_words", "longest_word" ];
            const bonus = {};
                bonus[ "most_words" ] = new Map();
                bonus[ "longest_word" ] = new Map();
            this.bonus = bonus;

            const round = document.createElement( "td" );
                round.innerText = this.round;
                round.classList.add( "cell" );

            const cards = document.createElement( "td" );
                cards.innerText = this.cards; 
                cards.classList.add( "cell" );
                cards.classList.add( "div" );

            this.element = document.createElement( "tr" );
            this.element.addEventListener( "contextmenu", ( e ) => this.unlock( e ) );
            this.element.appendChild( round );
            this.element.appendChild( cards );

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

                let confirmed = false;

                // add bonuses to each player
                const add = ( key ) =>
                {
                    if ( score[ key ] )
                    {
                        bonus[ key ].set( player.name, player );
                    }
                };

                bonuses.forEach( key => add( key ) );

                // check that only one player has the bonus
                const check = ( key ) =>
                {   
                    // bonus awarded
                    if ( bonus[ key ].size == 1 )
                    {
                        bonus[ key ].forEach( player => confirmed = this.report( { message: `${ player.name } awarded the ${ key.replace( "_", " " ) } bonus`, type: key } ) );
                    }
                    // bonuses revoked
                    else if ( bonus[ key ].size > 1 )
                    {
                        this.disable();
                        
                        const checkboxes = this.element.querySelectorAll( `[ name = "${ key }" ]` );

                        Array.from( checkboxes ).forEach( checkbox => 
                        {
                            checkbox.checked = false;
                            checkbox.removeAttribute( "checked" );
                        } );

                        players.forEach( player => 
                        {
                            const score = player.rounds.get( this.cards );
                                score.update( this, player, key, false );
                                score.output();

                            player.update( score );
                        } );

                        confirmed = this.report( { message: `${ key.replace( "_", " " ) } bonuses revoked`, type: key } );

                        if ( confirmed )
                        {
                            bonus[ key ] = new Map();
                            this.enable();
                        }
                    }
                    // no bonuses
                    else
                        confirmed = this.report( { message: `no ${ key } bonuses awarded`, type: key } );;
                };

                if ( flagged.size == players.size )
                {
                    bonuses.forEach( key => check( key ) );

                    if ( confirmed )
                        this.enable();
                }
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
            this.subtotal = () => this.card_total + this.most_words + this.longest_word;
            this.update = ( round, player, key, bool ) => 
            {
                this[ key ] = bool ? 10 : 0;

                if ( !bool )
                {
                    round.bonus[ key ].delete( player.name ); 
                }
            };
            
            this.element = document.createElement( "td" );
            this.element.classList.add( "cell" );
            this.element.classList.add( "field" );
        };

        const Cell = function( round, player )
        {   
            // clear
            this.element.innerHTML = null;
            this.element.style.padding = 0;
            
            const row1 = document.createElement( "tr" );
            const row2 = document.createElement( "tr" );
            const row3 = document.createElement( "tr" );
            const table = document.createElement( "table" );
                table.appendChild( row1 );
                table.appendChild( row2 );
                table.appendChild( row3 );
            this.element.appendChild( table );
            
            //card total
            let cl = td( row1 );
                cl.innerText = "card total";
            
            let ct = document.createElement( "input" );
                ct.setAttribute( "name", "card_total" );
                ct.setAttribute( "min", 0 );
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
            let cc = td( row1 );
                cc.appendChild( ct );
            
            // most words
            let ml = td( row2 );
                ml.innerText = "most words";

            let mw = document.createElement( "input" );
                mw.classList.add( "shrimp" );
                mw.setAttribute( "name", "most_words" );
                mw.setAttribute( "type", "checkbox" );
            if ( !!this.most_words )
                mw.setAttribute( "checked", "" );
                mw.addEventListener( "change", () => 
                {
                    this.update( round, player, "most_words", mw.checked );
                    this.refresh();
                } );
                mw.title = "most words";
            let mc = td( row2 );
                mc.appendChild( mw );

            // longest word
            let ll = td( row3 );
                ll.innerText = "longest word";

            let lw = document.createElement( "input" );
                lw.classList.add( "shrimp" );
                lw.setAttribute( "name", "longest_word" );
                lw.setAttribute( "type", "checkbox" );
            if ( !!this.longest_word )
                lw.setAttribute( "checked", "" );
                lw.addEventListener( "change", () => 
                {
                    this.update( round, player, "longest_word", lw.checked );
                    this.refresh();
                } );
                lw.title = "longest word";
            let lc = td( row3 );
                lc.appendChild( lw );

            // subtotal element
            this.st = td( row1 );
            this.st.rowSpan = 3;
            this.st.classList.add( "oversize" );
            this.output();

            this.refresh = () =>
            {
                this.output();
                round.flag( player, this );
                player.update( this );
            };

            function td( tr )
            {
                let td = document.createElement( "td" ); 
                    td.style.padding = 0;
                tr.appendChild( td );

                return td;
            }
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