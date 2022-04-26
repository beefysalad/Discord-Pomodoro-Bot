
const { joinVoiceChannel, getVoiceConnection, createAudioPlayer, createAudioResource, NoSubscriberBehavior, AudioPlayerStatus, VoiceConnectionStatus} = require('@discordjs/voice')
const Discord = require('discord.js')
const { Client, Intents, VoiceChannel }  = require('discord.js')


const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES,Intents.FLAGS.GUILD_VOICE_STATES] });
const {prefix, token} = require('./config.json')

const path = require('path')
const full_path = path.resolve('./new.mp3')
console.clear()
client.on('ready', ()=>{
    console.log(`We have logged in as ${client.user.tag}`)
    client.user.setPresence({
        activities: [
        {   name: "$help",
           type: "PLAYING"}
        ]
    })
})
let bool = false
let connection
let todo = []
let interval
let flag, flag2,canRemove,timerStop=false,goon=false
let target
let myTime,continueTime, breakTime
let cont = false, sbrk=false,lbrk=false,hasTime=false
let start = true
client.on('messageCreate',async(msg)=>{
    
    if(!msg.content.startsWith(prefix) || msg.author.bot) return
    const args = msg.content.slice(prefix.length).trim().split(' ')
    const command = args.shift().toLowerCase()
    // console.log(msg.author.id)
    if(command==='help'){
        const msgEmbed = new Discord.MessageEmbed()
            .setColor('#190933')
            .setTitle('Alora Bot Commands')
            .setAuthor(' Author | John Patrick','https://i.ytimg.com/vi/49CfvTG6kvU/maxresdefault.jpg', 'https://github.com/beefysalad' )
            .setDescription('Pomodoro Bot that helps you become productive and beat procrastinaton! || Still in the first stage of development so there are alot of known bugs!')
            .setThumbnail('https://i.ytimg.com/vi/49CfvTG6kvU/maxresdefault.jpg')
            .addFields(
                {name: 'Start', value: '$start - notifies the bot that you want to start a pomodoro'},
                {name: 'Stop', value: '$stop - notifies the bot that you want to stop the pomodoro (Will only prompt once you start a pomodoro)'},
                {name: 'Add Task', value: '$add_task_title - Adds an entry to your todo list. (Will only prompt once you start a pomodoro)'},
                {name: 'Set Timer', value: '$set_minutes - Sets the minutes for your customed timer. (Will only prompt once you start a pomodoro)'},
                {name: 'Remove task from list', value: '$designated_task_number - Removes a task from the list depending on what the task number is(Will only prompt after a pomodoro round is done)'},
                {name:'Short break', value:'$sb - Gives you a short break (5 mins) after finishing a round of pomodoro (Will only prompt after a pomodoro round is done)'},
                {name:'Long break', value:'$lb - Gives you a long break (15 mins) after finishing a round of pomodoro (Will only prompt after a pomodoro round is done)' }

            )
            .setFooter('Built using NodeJavsScript || Discord.js')
            .setTimestamp()
            msg.channel.send({embeds: [msgEmbed]})
    }
    else if((command==='start')){
        // msg.channel('You have started a pomodor! Please follow the steps below to set-up your pomodoro')
        let voiceChan = msg.member.voice.channel
        if(!voiceChan){
            msg.reply('You must be in a voice channel to start a pomodoro!')
            return
        }
        var info = {}
        info.id = msg.author.id
        info.list = []
        info.time
        info.target 
        todo.push(info)
        const msgEmbed = new Discord.MessageEmbed()
            .setColor('#190933')
            .setTitle('Alora Bot')
            .setDescription('You have started a pomodoro! Please follow the steps below to set-up your pomodoro')
            .addFields(
                {name: '1.)  Add Task:', value:'(Example) $add Studying Database Management - Adds the specified task to your todo list'},
                {name: '2.)  Set Timer', value:'(Example) $set 25 - sets the timer to be 25 minutes'}
            )
            .setFooter('Built using NodeJavsScript || Discord.js')
            .setTimestamp()
        msg.reply({embeds: [msgEmbed]})
       
        console.log(todo)
        bool=true
    }
    else if( (command.startsWith('add') || command.startsWith('a')))
    {
        let indicator
        const filtered = msg.content.split(" ")
        let msgSplit = " "
        // console.log(`ang value sa napase gikan sa prev function ${testing}`)
        if(bool)
        {
            for(let i = 0; i<filtered.length; i++){
                if(i!==0)
                {
                    msgSplit += `${filtered[i]} `
                }
            }
            for(let i =0; i<todo.length; i++){
                if(todo[i].id === msg.author.id)
                {
    
                    indicator = i
                    console.log(`authors info is at index ${indicator}`)
                    todo[i].list.push(msgSplit)
                    
                }
            }
            const msgEmbed = new Discord.MessageEmbed()
                .setColor('#190933')
                .setTitle(`Todo list for ${msg.author.username}`)
                .setDescription('You have added an item in your to-do list!')
            for(let i=0; i<todo.length; i++){
                
                if(todo[i].id === msg.author.id)
                {
                    
                    for(let n =0; n<todo[i].list.length; n++){
                        msgEmbed.addFields(
                            
                            {name:`Task ${n+1}`, value:todo[i].list[n]}
                        )
                    }
                }
            }
            console.log(todo)
            console.log(`Lenght of array of objects is : ${todo.length}`)
            msg.reply({embeds: [msgEmbed]})
           
        }
        else{
            const msgEmbed = new Discord.MessageEmbed()
            .setColor('#190933')
            .setTitle(`Invalid!`)
            .setDescription('You must first start a pomodoro in order to make a to do list')
            msg.reply({embeds: [msgEmbed]})
      
        }
    }
    else if(command==='stop' || command==='st')
    {
        if(bool)
        {
            clearInterval(myTime)
            timerStop = false
            const del = todo.filter((entry)=>{
                return entry.id !== msg.author.id
            })
            
            todo = del
            const msgEmbed = new Discord.MessageEmbed()
            .setColor('#190933')
            .setTitle(`Thank you for using me :)`)
            .setDescription('You have successfully stopped your pomodoro entry')
            msg.reply({embeds: [msgEmbed]})
         
            bool=false
            flag=false
        }
       else{
        const msgEmbed = new Discord.MessageEmbed()
        .setColor('#190933')
        .setTitle(`Invalid!`)
        .setDescription('You must first start a pomodoro in order to remove an entry')
        msg.reply({embeds: [msgEmbed]})
    
       }
        console.log(todo)
    }
    else if(command.startsWith('set'))
    {
        if(bool)
        {   
            const filtered = msg.content.split(" ")
            let msgSplit = " "
                for(let i = 0; i<filtered.length; i++){
                    if(i!==0)
                    {
                        msgSplit += `${filtered[i]} `
                    }
                }
            if(isNaN(parseFloat(msgSplit)))
            {
                const msgEmbed = new Discord.MessageEmbed()
                .setColor('#190933')
                .setTitle(`Invalid!`)
                .setDescription('Input must only be a number! Try again')
                msg.reply({embeds: [msgEmbed]})
            
                
            }
            else{
                for(let i =0; i<todo.length; i++)
                {
                    if(todo[i].id === msg.author.id)
                    {
                        todo[i].time = parseFloat(msgSplit)
                        todo[i].target = todo[i].time * 60
                        hasTime = true
                    }
                }
                const msgEmbed = new Discord.MessageEmbed()
                .setColor('#190933')
                .setTitle(`Do you want to start the timer?`)
                // .setDescription('$yes || $np')
                .addFields(
                    {name: 'Yes', value: '$yes or $y'},
                    {name: 'No', value: '$no or $n'}
                )
                console.log(todo)
                msg.reply({embeds: [msgEmbed]})
              
                flag =true   
            }
        }
        else{
            const msgEmbed = new Discord.MessageEmbed()
            .setColor('#190933')
            .setTitle(`Invalid!`)
            .setDescription('You must first start a pomodoro in order to remove your entry')
            msg.reply({embeds: [msgEmbed]})
           
        }
    }
    else if(command==='time')
    {
        // interval = setInterval(function(){
        //     msg.channel.send('ONE MINUTE NA CHUY')
        //     .catch(console.error)
        // },20000)
        msg.reply('HELLO THIS WILL BE DEELETED AFTER 5 SECS')
                .then(msg => {
                    msg.delete({ timeout: 5000 /*time unitl delete in milliseconds*/});
                })
                .catch(e=> {console.log()})
    }
    else if((command==='yes' || command==='y'))
    {
        let ina
        const msgEmbed = new Discord.MessageEmbed()
            .setColor('#190933')
        for(let i = 0; i<todo.length; i++)
            {
                if(todo[i].id === msg.author.id)
                {
                    target=todo[i].time
                    ina = i
                }
            }
  
        if(flag)
        {
             msgEmbed.setTitle(`Roger that!`)
             msgEmbed.setDescription(`The timer has started! I'll notify you when its time for your breaktime! :)`)
             msg.channel.send({embeds: [msgEmbed]})
         
            timerStop = true
            let sec = 1
            target = target * 60
            myTime = setInterval(function(){
               
                sec+=1
                if(sec === target){
                    msgEmbed.setTitle('Time out!')
                    joinVc(msg)
                    msgEmbed.setDescription('Great Job! You have finished a pomodoro round!\n What did you accomplish during this round of pomodoro?')
                    for(let i=0; i<todo.length; i++){
                            
                        if(todo[i].id === msg.author.id)
                        {
                            
                            for(let n =0; n<todo[i].list.length; n++){
                                msgEmbed.addFields(
                                    
                                    {name: `Task ${n+1}`, value: todo[i].list[n]}
                                )
                            }
                        }
                    }
                   
                    msgEmbed.addField('Example', `$1 - Removes the accomplished designated task number one from the list(If there are no more tasks remaining in your list, pomodoro will automatically stop)\n\n$c - Continue for another ${target/60} minutes without break\n\n$lb - Have a 15 minutes break\n\n$sb - Have a 5 minutes break`)
            
                    msg.reply({embeds: [msgEmbed]})
                   
                    canRemove = true
                    cont = true
                    sbrk = true
                    lbrk=true
                    clearInterval(myTime)
                }
                },1000)
            
        }
        else
        {
            msg.reply('Timer not set!')
        }
        
    }
    else if(canRemove && (!isNaN(parseFloat(command))))
    {
        
        // console.log(parseFloat(command))
        let ina
        for(let i =0; i<todo.length; i++)
        {
            if(todo[i].id === msg.author.id)
            {
                ina = i
            }
            
        }
        if((command>todo[ina].list.length)||(command==='0'))
        {
            msg.reply('Number is out of range!')
        }
        else{
            
           
            for(let n=0; n<todo[ina].list.length; n++)
            {
                if(n===(command-1))
                {
                    todo[ina].list.splice(n,1)
                    const msgEmbed = new Discord.MessageEmbed()
                    .setColor('#190933')
                    .setTitle(`To-do list`)
                    .setDescription('You have removed a task from the list! Your remaining tasks are')
                    console.log(`current lenght after removing is ${todo[ina].list.length}`)
                    if(todo[ina].list.length===0)
                    {   msgEmbed.setTitle(`Good bye!`)
                        msgEmbed.setDescription('Good job on finishing up your todo list! I will now automatically stop')
                        // msgEmbed.addFields(
                        //     {name: 'Empty', value: 'You dont have any more tasks remaining!'},
                        //     {name:'Continue? (Y/N)', value:'Do you want to continue?'}
                        // )
                        const del = todo.filter((entry)=>{
                            return entry.id !== msg.author.id
                        })
                        msg.channel.send({embeds: [msgEmbed]})
                        
                        canRemove=false
                        console.log(canRemove)
                        todo = del
                        break
                    }
                    else if(todo[ina].list.length!==0)
                    {
                        for(let i=0; i<todo[ina].list.length; i++)
                        {
                            msgEmbed.addFields(
                                {name: `Task ${i+1}`, value: todo[ina].list[i]}
                            )
                        }
                    }
                   
                    msg.channel.send({embeds: [msgEmbed]})
                    
                }
          
            }
            console.log(todo)
            
        }
        
    }
    else if((command==='continue'|| command==='c') && cont ){
        
        const msgEmbed = new Discord.MessageEmbed()
            .setColor('#190933')
            .setTitle(`Roger that!`)
            .setDescription("The timer has started! I'll notify you when its time for your breaktime! :)")
        msg.reply({embeds: [msgEmbed]})
     
        cont = false
        let sec = 1
        continueTime = setInterval(function(){
            
            sec+=1
            if(sec === target){
                joinVc(msg)
                msgEmbed.setTitle('Time out!')
                msgEmbed.setDescription('Great Job! You have finished a pomodoro!\n What did you accomplish during this round of pomodoro?')
                for(let i=0; i<todo.length; i++){
                        
                    if(todo[i].id === msg.author.id)
                    {
                        
                        for(let n =0; n<todo[i].list.length; n++){
                            msgEmbed.addFields(
                                
                                {name: `Task ${n+1}`, value: todo[i].list[n]}
                            )
                        }
                    }
                }
                canRemove = true
                // msgEmbed.addField('Example', `$1 - Removes the accomplished designated task number one from the list(If there are no more tasks remaining in your list, pomodoro will automatically stop)\n\n$c - Continue for another ${target/60} minutes without break\n\n$lb - Have a 15 minutes break\n\n$sb - Have a 5 minutes break`)
        
                msg.reply({embeds: [msgEmbed]})
             
                
                cont = true
                sbrk = true
                lbrk=true
                clearInterval(continueTime)
            }
            },1000)
    }
    else if((command==='sb') && sbrk ){
        
        const msgEmbed = new Discord.MessageEmbed()
            .setColor('#190933')
            .setTitle(`Roger that!`)
            .setDescription("Alrighty then! Ill notify you once your short break is done! :)")
            let sec = 1
            let sud = false
            // target = target * 60
            breakTime = setInterval(function(){
               
                sec+=1
                if(sec === 300){
                    joinVc(msg)
                    msgEmbed.setTitle('Short Break Timeout!')
                    msgEmbed.setDescription('Break times over! Timer will automatically start. Goodluck! :)\n\nYour remaining tasks are:')
                    for(let i=0; i<todo.length; i++){
                            
                        if(todo[i].id === msg.author.id)
                        {
                            
                            for(let n =0; n<todo[i].list.length; n++){
                                msgEmbed.addFields(
                                    
                                    {name: `Task ${n+1}`, value: todo[i].list[n]}
                                )
                            }
                        }
                        
                    }
                    canRemove = true
                    msg.reply({embeds: [msgEmbed]})
                     
                    
                    cont = true
                    sbrk = true
                    lbrk=true
                    sud=true
                    clearInterval(breakTime)
                    let secz = 1
                    continueTime = setInterval(function(){
                        console.log(secz)
                        secz+=1
                        if(secz === target){
                            msgEmbed.setTitle('Time out!')
                            msgEmbed.setDescription('Great Job! You have finished a pomodoro!\n What did you accomplish during this round of pomodoro?')
                            for(let y=0; y<todo.length; y++){
                                
                                if(todo[y].id === msg.author.id)
                                {
                                    
                                    for(let x =0; x<todo[y].list.length-(todo[y].list.length); x++){
                                        
                                        msgEmbed.addFields(
                                            
                                            {name: `Task ${x+1}`, value: todo[y].list[x]}
                                        )
                                    }
                                }
                            }
                            canRemove = true
                            // msgEmbed.addField('Example', `$1 - Removes the accomplished designated task number one from the list(If there are no more tasks remaining in your list, pomodoro will automatically stop)\n\n$c - Continue for another ${target/60} minutes without break\n\n$lb - Have a 15 minutes break\n\n$sb - Have a 5 minutes break`)
                    
                            msg.channel.send({embeds: [msgEmbed]})
                           
                            flag2 = true
                            cont = true
                            sbrk = true
                            lbrk=true
                            clearInterval(continueTime)
                        }
                        },1000)
                   
                }
            },1000)
              
        msg.reply({embeds: [msgEmbed]})
    }
    else if((command==='lb') && lbrk ){
        
        const msgEmbed = new Discord.MessageEmbed()
            .setColor('#190933')
            .setTitle(`Roger that!`)
            .setDescription("Alrighty then! Ill notify you once your long break is done! :)")
            let sec = 1
            // target = target * 60
            breakTime = setInterval(function(){
                
                sec+=1
                if(sec === 900){
                    joinVc(msg)
                    msgEmbed.setTitle('Long Break Timeout!')
                    msgEmbed.setDescription('Break times over! Timer will automatically start. Goodluck! :)\n\nYour remaining tasks are:')
                    for(let i=0; i<todo.length; i++){
                            
                        if(todo[i].id === msg.author.id)
                        {
                            
                            for(let n =0; n<todo[i].list.length-(todo[i].list.length); n++){
                                msgEmbed.addFields(
                                    
                                    {name: `Task ${n+1}`, value: todo[i].list[n]}
                                )
                            }
                        }
                        goon = true
                    }
                    canRemove = true
                    msg.reply({embeds: [msgEmbed]})
                  
                    flag2 = true
                    cont = true
                    brk = true
                    clearInterval(breakTime)
                    let secz = 1
                        continueTime = setInterval(function(){
                            
                            secz+=1
                            if(secz === target){
                                msgEmbed.setTitle('Time out!')
                                msgEmbed.setDescription('Great Job! You have finished a pomodoro!\n What did you accomplish during this round of pomodoro?')
                                for(let i=0; i<todo.length; i++){
                                        
                                    if(todo[i].id === msg.author.id)
                                    {
                                        
                                        for(let n =0; n<todo[i].list.length; n++){
                                            msgEmbed.addFields(
                                                
                                                {name: `Task ${n+1}`, value: todo[i].list[n]}
                                            )
                                        }
                                    }
                                }
                                canRemove = true
                                // msgEmbed.addField('Example', `$1 - Removes the accomplished designated task number one from the list(If there are no more tasks remaining in your list, pomodoro will automatically stop)\n\n$c - Continue for another ${target/60} minutes without break\n\n$lb - Have a 15 minutes break\n\n$sb - Have a 5 minutes break`)
                        
                                msg.channel.send({embeds: [msgEmbed]})
                               
                               
                                cont = true
                                sbrk = true
                                clearInterval(continueTime)
                            }
                            },1000)
                }
                },1000)
        msg.reply({embeds: [msgEmbed]})
    }
    else if(command==='j'){
        joinVc(msg)
    }
  

})

function joinVc(msg){
    const resource = createAudioResource(full_path,
     {
        inlineVolume: true
     });
    connection = joinVoiceChannel({
            channelId: msg.member.voice.channel.id,
            guildId: msg.member.guild.id,
            adapterCreator: msg.member.guild.voiceAdapterCreator,
            selfDeaf: false
    })
    let player = createAudioPlayer({
            behaviors:{
            noSubscriber: NoSubscriberBehavior.Pause
            }
     });
    connection.on(VoiceConnectionStatus.Signalling, () => {
        console.log('The connection has entered the Signal state');
    });
    connection.on(VoiceConnectionStatus.Connecting, () => {
        console.log('The connection has entered the connecting state - attempting to connect to channel');
    });
    connection.on(VoiceConnectionStatus.Ready, () => {
        console.log('The connection has entered the Ready state - ready to play audio!');
    });
                
    resource.volume.setVolume(0.5)
    player.play(resource)
    player.on('error', error => {
    console.error(`Error: ${error.message} with resource ${error.resource.metadata.title}`);
    player.play(getNextResource());
    });
    connection.subscribe(player)
    player.on(AudioPlayerStatus.Idle,()=>{
        connection.destroy()

    })
    connection.on(VoiceConnectionStatus.Destroyed,()=>{
        console.log("The connection has entered destroyed mode - connection will be destroyed")
    })
}
client.login(token)

