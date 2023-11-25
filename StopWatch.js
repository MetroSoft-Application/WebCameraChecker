var start;
var state = 'STOP';
var timer_id;

// ゼロを追加する
function AddZero(value)
{
    if (value < 10)
    {
        value = '0' + value;
    }
    return value;
};

function TimeClear()
{
    Stop();
    document.getElementById('time').innerText = '00' + ':' + '00' + ':' + '00';
}

function GoTimer()
{
    var now = new Date();

    var milli = now.getTime() - start.getTime(); // 差をミリ秒で
    var seconds = Math.floor(milli / 1000); // 秒を取得
    var minutes = Math.floor(seconds / 60); // 分を取得
    var hours = Math.floor(minutes / 60); // 時を取得

    milli = ('000' + milli).slice(-3);//ミリ秒の表示桁数指定

    seconds = seconds - minutes * 60;
    minutes = minutes - hours * 60;

    // 1 桁の場合は 0 を補完
    hours = AddZero(hours);
    seconds = AddZero(seconds);
    minutes = AddZero(minutes);

    //document.getElementById('time').innerHTML = hours + ':' + minutes + ':' + seconds + "." + milli;
    document.getElementById('time').innerText = hours + ':' + minutes + ':' + seconds;
}

function Start()
{
    start = new Date();
    timer_id = setInterval(GoTimer, 10);
}

function Stop()
{
    clearInterval(timer_id);
}

function StartOrStopControl()
{
    if (state == 'STOP')
    {
        start = new Date();
        timer_id = setInterval(goTimer, 10);
        state = 'RUNNING';
    } else
    {
        clearInterval(timer_id);
        state = 'STOP';
    }
}