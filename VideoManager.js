class VideoManager
{
    video = null;
    nowAngle = 0;
    stm = null;
    recorder = null;
    recordedChunks = [];
    isMirrored = false;
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

    ToggleMirror()
    {
        if (this.video == null)
        {
            console.error("Video not initialized.");
            return;
        }
        this.isMirrored = !this.isMirrored;
        if (this.isMirrored)
        {
            // X軸で反転
            this.video.style.transform = `rotate(${this.nowAngle}deg) scaleX(-1)`;
        }
        else
        {
            this.video.style.transform = `rotate(${this.nowAngle}deg)`;
        }
    }

    Rotate(cmdAngle)
    {
        if (this.video == null)
        {
            console.error("Video not initialized.");
            return;
        }
        this.nowAngle = this.nowAngle + cmdAngle;
        if (this.isMirrored)
        {
            // ミラー反転の状態を保持
            this.video.style.transform = `rotate(${this.nowAngle}deg) scaleX(-1)`;
        }
        else
        {
            this.video.style.transform = `rotate(${this.nowAngle}deg)`;
        }
    }

    TakeSnapshot()
    {
        if (!this.video)
        {
            console.error("Video not initialized.");
            return null;
        }

        // canvas要素を作成して、videoの映像をそこに描画
        let canvas = document.createElement('canvas');
        canvas.width = this.video.videoWidth;
        canvas.height = this.video.videoHeight;
        let ctx = canvas.getContext('2d');

        // ミラーリングや回転を考慮して描画
        ctx.save();
        if (this.isMirrored)
        {
            ctx.scale(-1, 1);
            ctx.translate(-canvas.width, 0);
        }
        ctx.rotate(this.nowAngle * Math.PI / 180);
        ctx.drawImage(this.video, 0, 0, canvas.width, canvas.height);
        ctx.restore();

        // canvasの内容をDataURLとして返す
        return canvas.toDataURL('image/png');
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