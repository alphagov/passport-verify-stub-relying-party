FROM govukverify/java8:latest

EXPOSE 50400

COPY local-vsp-only.env /local-vsp-only.env

RUN apt-get install -y unzip

RUN wget -q https://github.com/alphagov/verify-service-provider/releases/download/1.0.0/verify-service-provider-1.0.0.zip

RUN unzip -q verify-service-provider*.zip

CMD /bin/bash -c 'source /local-vsp-only.env && cd verify-service-provider-1.0.0 && ./bin/verify-service-provider server ./verify-service-provider.yml'
