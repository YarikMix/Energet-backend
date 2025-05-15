class PVGIS_Hor {

    async Get_PVGIS_Hor(params_coords) {
        
        let PVGIS_Hor;

        try {
            const get_Hor = await fetch("https://re.jrc.ec.europa.eu/api/v5_2/printhorizon?lat=" + params_coords[0] + "&lon=" + params_coords[1] + "&outputformat=json")
            if (get_Hor.ok) {
                PVGIS_Hor = get_Hor.json();
            } else {
                console.error('PVGIS не отвечает (не удалось получить профиль горизонта PVGIS)')
                throw new Error('PVGIS не отвечает (не удалось получить профиль горизонта PVGIS)')
            }
        } catch {
            console.error('Ошибка сети (не удалось получить профиль горизонта PVGIS)')
            throw new Error('Ошибка сети (не удалось получить профиль горизонта PVGIS)')
        }

        PVGIS_Hor = (await PVGIS_Hor).outputs.horizon_profile;
        let horison = [];
        for (let i = 0; i < PVGIS_Hor.length; i++) {
            horison[i] = [(Math.PI/180)*PVGIS_Hor[i].A, (Math.PI/180)*PVGIS_Hor[i].H_hor];
        }

        return horison;
    }

}

module.exports = new PVGIS_Hor()