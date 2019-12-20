FROM openjdk:11-jdk-slim

EXPOSE 50400


COPY local-vsp-only.env /local-vsp-only.env
COPY acceptance-tests/verify-service-provider-with-matching.yml /verify-service-provider-with-matching.yml

ENV VERIFY_USE_PUBLIC_BINARIES=true
RUN apt-get update && apt-get install -y git && apt-get clean
RUN git clone https://github.com/alphagov/verify-service-provider.git
RUN cd verify-service-provider && ./gradlew installDist
RUN mv /verify-service-provider/build/install/verify-service-provider vsp

CMD /bin/bash -c 'source /local-vsp-only.env && /vsp/bin/verify-service-provider server /verify-service-provider-with-matching.yml'
