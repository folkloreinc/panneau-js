function formatDuration(timeInSeconds: number | string): string {
    const numberOfSeconds = parseInt(String(timeInSeconds), 10); // don't forget the second param
    let hours: number | string = Math.floor(numberOfSeconds / 3600);
    let minutes: number | string = Math.floor((numberOfSeconds - (hours as number) * 3600) / 60);
    let seconds: number | string =
        numberOfSeconds - (hours as number) * 3600 - (minutes as number) * 60;
    if (hours < 10) {
        hours = `0${hours}`;
    }
    if (minutes < 10) {
        minutes = `0${minutes}`;
    }
    if (seconds < 10) {
        seconds = `0${seconds}`;
    }
    return `${hours}:${minutes}:${seconds}`;
}

export default formatDuration;
