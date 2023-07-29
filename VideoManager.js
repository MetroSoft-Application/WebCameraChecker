class VideoManager
{
    video = null;
    nowAngle = 0;
    stm = null;
    recorder = null;
    recordedChunks = [];
    constructor()
    {
    }

    async GetVideo(isAudioEnable)
    {
        try
        {
            this.video = document.getElementById("video");
            this.stm = await navigator.mediaDevices.getUserMedia({
                audio: isAudioEnable,
                video: true
            });
            this.video.srcObject = this.stm;
            this.video.play();
            return true;
        } catch (e)
        {
            console.log(e);
            return false;
        }
    }

    StopVideo()
    {
        this.stm = null;
        this.video.srcObject = null;
    }



    Rotate(cmdAngle)
    {
        if (this.video == null)
        {
            return;
        }
        this.nowAngle = this.nowAngle + cmdAngle;
        this.video.style.transform = "rotate(" + this.nowAngle + "deg)";
    }

    Download()
    {
        let blob = new Blob(this.recordedChunks, {
            type: "video/webm"
        });
        let url = URL.createObjectURL(blob);
        let anchor = document.getElementById('Downloadlink');
        anchor.href = url;
        anchor.download = this.GetNowYMDhmsStr() + ".webm";
    }

    Recoading()
    {
        if (this.stm == null)
        {
            return;
        }
        this.recorder = new MediaRecorder(this.stm, {
            audioBitsPerSecond: 16 * 1000
        });
        this.recordedChunks = [];
        this.recorder.addEventListener('dataavailable', function (event)
        {
            if (event.data.size > 0)
            {
                this.recordedChunks.push(event.data);
            }
        }.bind(this));
        this.recorder.start();
        this.recorder.addEventListener('stop', function (event)
        {
            this.Download();
        }.bind(this));
    }

    StopRecoading()
    {
        if (this.recorder != null)
        {
            this.recorder.stop();
            return true;
        }
        return false;
    }

    GetNowYMDhmsStr()
    {
        const date = new Date()
        const Y = date.getFullYear()
        const M = ("00" + (date.getMonth() + 1)).slice(-2)
        const D = ("00" + date.getDate()).slice(-2)
        const h = ("00" + date.getHours()).slice(-2)
        const m = ("00" + date.getMinutes()).slice(-2)
        const s = ("00" + date.getSeconds()).slice(-2)

        return Y + M + D + h + m + s
    }
}