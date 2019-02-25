//function copied out to separate file to make it easier to manage

const getActivities = (req, res, postgresDB, bcrypt, saltRounds) => {
	 
		const { userName, roomName} = req.body;  
		
		console.log("signin test0 ", roomName);
		//run some validation, don't allow any field to be blank OR empty spaces
		if ( !roomName.trim() ){
			//need a return here, to exit the function early so a fail on validation does not allow code to proceed
			return res.status(400).json('incorrect form submission1');			
		}
		
		console.log("signin test1.1");
		  
		postgresDB('miscdata').select('data')
		.where('catlist','=','_anonActiv')
		.then(theData => { 
			console.log("signin the data herezo: ",theData[0]);
			const isMaster= bcrypt.compareSync(roomName,theData[0].data);			
			
			console.log("signin test2.2");
			//if so, then this is actually admin
			//return key to go to settings screen
			if (isMaster) { 
				console.log("signin we are master test 3");
				return res.json("roomSetup"); 
			} else {
				//if room is valid and we had the random indices, get and pass the random indices back
				
				//need a test case here to check if room doesn't exist, to not move forward.
				//maybe covered just via error message?
				
				//if  room name exists, get the data for the room
				console.log("signin test4 signin roomname isss: ", roomName);  
				
				//check here if a room already exists. 
				// if it does, then...
				postgresDB('miscdata').select('catlist','data')
				.where('catlist','like','anonActivRoom%')
				.where('key','=',roomName)
				.then(theData2 => { 
					 console.log("signin thedata2 ",theData2) 
					  
					  console.log("signin after listmaking");
					console.log("signin test7");
					return res.json(theData2); 
				})	
			}
		})
		.catch (err => res.status(400).json('failure, you email/credentials are'))  
		
		 console.log("signin test5"); 

	}

module.exports = {
	getActivities: getActivities
}