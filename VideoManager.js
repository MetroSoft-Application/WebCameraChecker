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

    async GetVideo(isAudioEnable, videoDeviceId)
    {
        try
        {
            this.video = document.getElementById("video");
            this.stm = await navigator.mediaDevices.getUserMedia({
                audio: isAudioEnable,
                video: { deviceId: videoDeviceId }
            });
            this.video.srcObject = this.stm;
            this.video.play();
            return true;
        }
        catch (e)
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

        this.nowAngle = (this.nowAngle + cmdAngle) % 360;
        if (this.nowAngle < 0)
        {
            // 角度を正の値に保つ
            this.nowAngle += 360;
        }

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

        ctx.save();
        // ミラーリングや回転を考慮して描画
        // 原点をキャンバスの中心に移動
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(this.nowAngle * Math.PI / 180);

        if (this.isMirrored)
        {
            ctx.scale(-1, 1);
        }

        // 中心に移動した分だけ、描画位置も調整
        ctx.drawImage(this.video, -canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
        ctx.restore();

        // canvasの内容をDataURLとして返す
        return canvas.toDataURL('image/png');
    }


    Recording()
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

    StopRecording()
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
        let anchor = document.getElementById('Download');
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