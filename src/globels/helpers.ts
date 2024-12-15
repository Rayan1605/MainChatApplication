export class Helpers {

    static firstletter = (str: string): string => {
     const Vstring = str.toLowerCase();
        // the split For example, "hello world" becomes ["hello", "world"].
        // then we map through each value and make the first letter capital and the rest of the letters lowercase

        return Vstring.split(' ').map((value: string) => `${value.charAt(0).
     toUpperCase()}${value.slice(1).toLowerCase()}`).join(' ')
    }

    static lowerEmail = (email: string): string => {

        return email.toLowerCase();
}

static generateRandomColor = (integerLength: number): number => {
        const character = '0123456789';
        let result = ' ';
        const charactersLength = character.length;
        for (let i = 0; i < integerLength; i++){
            result += character.charAt(Math.floor(Math.random() * charactersLength));
        }
        return parseInt(result, 10);


}

}
