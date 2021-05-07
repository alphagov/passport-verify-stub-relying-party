FROM openjdk:11-jre-slim

ARG GITHUB_TOKEN=""

EXPOSE 50400

COPY local-vsp-only.env /local-vsp-only.env
COPY acceptance-tests/verify-service-provider-with-matching.yml /verify-service-provider-with-matching.yml

RUN apt-get update &&\
    apt-get install -y unzip jq curl wget &&\
    apt-get clean

RUN url="$(if [ -z "${GITHUB_TOKEN:-}" ];\
        then curl -s https://api.github.com/repos/alphagov/verify-service-provider/releases/latest | jq -r '.assets[0].browser_download_url';\
        else curl -s https://api.github.com/repos/alphagov/verify-service-provider/releases/latest -H "Authorization: token $GITHUB_TOKEN" | jq -r '.assets[0].browser_download_url';\
        fi)";\
    wget -q "$url"

RUN unzip -q verify-service-provider*.zip

CMD /bin/bash -c 'source /local-vsp-only.env && cd verify-service-provider*/ && ./bin/verify-service-provider server ../verify-service-provider-with-matching.yml'
