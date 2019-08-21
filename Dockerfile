FROM  is.jd.com/jdos_base/jd-centos7.2-nodejs8.2.1-ngx:v180130

#set openSSH
#RUN apt-get update
#RUN apt-get install -y openssh*
#
#RUN mkdir -p /var/run/sshd
#RUN mkdir -p /root/.ssh
#
##复制认证文件到相应位置
#ADD authorized_keys /root/.ssh/authorized_keys
#ADD run.sh /run.sh
#RUN chmod +x /run.sh

#开放端口
#EXPOSE 22

#设置自启动命令
#CMD ["/run.sh"]

# Create app directory
WORKDIR /app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
# COPY package*.json ./
# COPY .npmrc ./

RUN npm install hexo-cli -g
RUN npm install --registry=http://registry.m.jd.com
RUN hexo server

# COPY . .
# If you are building your code for production
# RUN npm install --only=production

# Bundle app source

# RUN chmod +x /app/start.sh

# ENTRYPOINT /usr/sbin/sshd  && echo | cat /etc/jdos_host >> /etc/hosts && npm run prod &&sleep 9999d
