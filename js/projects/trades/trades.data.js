const Data = function( data )
{
    const actions = [ "BUY", "SELL" ];

    this.symbol = data.symbol;
    this.action = data.action;
    this.sign = actions.indexOf( this.action ) * 2 - 1;
    this.qty = Number( data.qty ) || 0;
    this.price = Number( data.price ) || 0;
    this.value = Math.round( this.qty * this.price * this.sign * 100 ) / 100;
    this.brokerage = data.brokerage;
    this.date = data.date;
    this.time = data.time;
};

export default Data;
