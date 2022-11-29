const { Client, LocalAuth, MessageMedia} = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data'); 
const path = require('path');
    const client = new Client({
        authStrategy: new LocalAuth()
    }); 
    
            client.on('qr', (qr) => {
                qrcode.generate(qr, {small:true});
            });
            
            client.on('authenticated', () => {
                console.log('authenticad')
            });
             
            client.on('auth_failure', msg => {
                // Fired if session restore was unsuccessful
                console.error('AUTHENTICATION FAILURE', msg);
            });
            client.on('ready', () => {
                console.log('Client is ready!');
            });
            client.initialize();

            client.on('message', msg => {
                if(msg.body === '$menu') {
                    const weekday = ["Minggu","Senin","Selasa","Rabu","Kamis","Jum'at","Sabtu"];
                    const d = new Date();
                    let day = weekday[d.getDay()];
                    msg.reply(

` Tahu Genjot
Serasa Digenjot Tobrut
Server Time : ${day} ${d.toLocaleTimeString()} ${ d.toLocaleDateString() }
 

    *List Menu*
*->* $sticker 
*->* $change<spasi>Change Group Name
*->* $gacha-waifu
*->* $all
*->* $cuaca<spasi>kota
*->* $removebg
    ASEDE
`);
            }
            
        });
            

        client.on('message', async(msg)=> {
            if(msg.body.startsWith('$sticker') && msg.type === 'image'){
                const media = await msg.downloadMedia();
                
                    msg.reply(media, msg.from, {
                        sendMediaAsSticker:true,
                        stickerName: "Tahu Genjot",
                        stickerAuthor: "Serasa digenjot Tobrut"
                    })
            } else if (msg.body.startsWith('$change ')) {
                // Change the group subject
                let chat = await msg.getChat();
                if (chat.isGroup) {
                    let newSubject = msg.body.slice(8); 
                    chat.setSubject(newSubject);
                } else {
                    msg.reply('This command can only be used in a group!');
                }
            }  else if (msg.body === '$gacha-waifulokal') {
                const waifu = ['Alice-Nakiri.jpeg', 'Belldandy.jpeg', 'KOCHO-SHINOBU.jpeg', 'Lenalee-Lee.jpeg', 'mai.jpeg', 'Megumi-Tadokoro.jpeg', 'Miku-nakano.jpeg', 'ram.jpeg', 'selee.jpeg', 'TATSUMAKI.png', 'Teletha.png'];
                const random = Math.floor(Math.random() * waifu.length);
        
                const media = MessageMedia.fromFilePath(`./waifu/${waifu[random]}`);
                
                msg.reply(media, msg.from, {
                    caption:"Gacha terus dan dapatkan waifu favoritmu"
                });
            } else if(msg.body === '$all') {
                const chat = await msg.getChat();
                if(!chat.isGroup){
                    msg.reply('this command can only used in a group!')
                }
                    // GET TIME ZONE
                        const time = new Date().getHours();
                        let timezone = '';
                        if( time >= 3 && time < 11 ){
                            timezone = 'Selamat Pagi';
                        } else if(time >= 11 && time < 15 ){
                            timezone = 'selamat siang';
                        } else if (time >= 15 && time < 18){
                            timezone = 'selamat sore';
                        } else {
                           timezone = 'selamat malam';
                        }
                    // LAST GET TIME ZONE
                let text = timezone + " " + "Member" + " " + chat.name;  
                let mentions = [];
        
                for(let participant of chat.participants) {
                    const contact = await client.getContactById(participant.id._serialized);
                    mentions.push(contact);
                    text += `@${participant.id.user} `;
                }
                await msg.reply(text, msg.from, {mentions});
        
            } else if(msg.body.startsWith('$cuaca ')){
                let weather = msg.body.slice(7);
                const yourapi = ''
                axios.get(`https://api.openweathermap.org/data/2.5/weather?appid=${yourapi}&units=metric&q=${weather}`)
                .then(function (response) {
                 const res = response.data;
                 cuaca(res);
               })    
               .catch(function (error) {
                    console.log(error);
                    // const err = error.data;
                    cuacaMiss(error)
               })
                        function cuaca (res){
                        msg.reply(`
Kota      : ${res.name}, ${res.sys.country}
Cuaca   : ${res.weather[0].main}, ${res.weather[0].description}
Suhu      : ${res.main.temp}°C 
Angin    : ${res.wind.speed} Speed, ${res.wind.deg} Deg,
        Source : openweathermap.org
        `)
                    }
                    function cuacaMiss(res){
                        msg.reply(` Nama Kota tidak ditemukan 
         ${res.message}`)
                    }
            } else if (msg.body === '$gacha-waifu'){
                axios.get('https://api.waifu.pics/sfw/waifu')
                .then(function(res){
                    console.log(res);
                    waif(res.data)
                })
                .catch(function(err){
                    console.log(err)
                })
                const waif =  async(res) => {
                    const media = await MessageMedia.fromUrl(res.url)
                    msg.reply(media, msg.from, {
                        caption: "gacha terus dan dapatkan waifu favoritmu"
                    });
                }
            } else if(msg.body.startsWith('$removebg') && msg.type === 'image'){
                 msg.downloadMedia()
                .then((res) => {
                    const random = Math.floor(Math.random() * 24123143123142).toString();
                    const pathImg = `./upload/${random}.png`;
                    fs.writeFileSync(pathImg, res.data, {encoding:'base64'});
                    removeBgApi(pathImg);
                })
                .catch((err) => {
                    console.log(err)
                })
                function removeBgApi(rdm){
                    const formData = new FormData();
                    formData.append('size', 'auto');
                    formData.append('image_file', fs.createReadStream(rdm), path.basename(rdm));
                    axios({
                        method: 'post',
                        url: 'https://api.remove.bg/v1.0/removebg',
                        data: formData,
                        responseType: 'arraybuffer',
                        headers: {
                          ...formData.getHeaders(),
                          'X-Api-Key': 'Your Api key',
                        },
                        encoding: null
                      })
                      .then((response) => {
                        if(response.status != 200) return console.error('Error:', response.status, response.statusText);
                        const random = Math.floor(Math.random() * 24123143123142).toString();
                        const urlGmbr = `./result/${random}.png`;
                        fs.writeFileSync(urlGmbr, response.data);
                         urlGm(urlGmbr);
                      })
                      .catch((error) => {
                          return console.error('Request failed:', error);
                      });
                      function urlGm(pat){
                        const media = MessageMedia.fromFilePath(pat)
                        msg.reply(media , msg.from, {
                            sendMediaAsDocument:true
                        })
                      }
                }
            }
        })
    