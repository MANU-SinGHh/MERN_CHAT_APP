// function to extract only msg sent time(hrs:min) instead of hrs min sec date etc
export function formatMessageTime(date){
    return new Date(date).toLocaleTimeString("en-US",{
        hour:"2-digit",
        minute:"2-digit",
        hour12:"false"
    })
}