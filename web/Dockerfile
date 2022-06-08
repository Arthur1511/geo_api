FROM node:12.22.5

# set working directory
RUN mkdir /usr/src/app
WORKDIR /usr/src/app

# add `/usr/src/app/node_modules/.bin` to $PATH
ENV PATH /usr/src/app/node_modules/.bin:$PATH


# install and cache app dependencies
COPY package.json /usr/src/app/package.json
RUN npm install --silent
RUN npm install react-scripts@3.3.1 -g --silent
#RUN npm install react-icons

COPY . ./

EXPOSE 3000

CMD ["yarn", "run", "start"]