'use strict'

const bcrypt = require('bcrypt-nodejs')

class User {

constructor(email, password, firstName, lastName, userType = 'student', privilege = 0 ) {
    if (email && password && firstName && lastName) {
      
       const salt = bcrypt.genSaltSync(10);
       const hashedPassword = bcrypt.hashSync(password, salt);

        this.email = email.toUpperCase();
        this.firstName = firstName;
        this.lastName = lastName;
        this.password = hashedPassword;
        this.userType = userType;
        this.privilege = privilege;
        this.objectType = 'User'
    
        if (this.__isContract) {
            delete this.__isContract;
          }
          if (this.name) {
            delete this.name;
          }
        return this;

    }
    else{
        throw new Error('email, password, first name or last name has do not exist');       
    }

}

}

module.exports = User;