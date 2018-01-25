FROM govukverify/java8:latest

EXPOSE 50400

COPY local-vsp-only.env /local-vsp-only.env

RUN apt-get install -y unzip
RUN apt-get install -y jq

RUN wget -q $(curl -s https://api.github.com/repos/alphagov/verify-service-provider/releases/latest | jq -r '.assets[0].browser_download_url')

RUN unzip -q verify-service-provider*.zip

CMD /bin/bash -c 'source /local-vsp-only.env && cd verify-service-provider*/ && ./bin/verify-service-provider server ./verify-service-provider.yml'
